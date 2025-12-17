"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createBlog, updateBlog } from "@/lib/blog-service";
import { storage } from "@/lib/firebase";
import type { Blog } from "@/lib/types";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from "firebase/storage";
import { ArrowLeft, ImageIcon, Save, Sparkles, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

interface BlogEditorProps {
  blog?: Blog;
}

export function BlogEditor({ blog }: BlogEditorProps) {
  const [title, setTitle] = useState(blog?.title || "");
  const [excerpt, setExcerpt] = useState(blog?.excerpt || "");
  const [content, setContent] = useState(blog?.content || "");
  const [coverImage, setCoverImage] = useState(blog?.coverImage || "");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [author, setAuthor] = useState(blog?.author || "Admin");
  const [published, setPublished] = useState(blog?.published || false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("[v0] Submitting blog:", {
        title,
        excerpt,
        coverImage,
        published,
      });

      if (blog) {
        await updateBlog(blog.id, {
          title,
          excerpt,
          content,
          coverImage,
          author,
          published,
        });
        toast({
          title: "Success!",
          description: "Blog post updated successfully.",
        });
      } else {
        const blogId = await createBlog({
          title,
          excerpt,
          content,
          coverImage,
          author,
          published,
        });
        console.log("[v0] Blog created with ID:", blogId);
        toast({
          title: "Success!",
          description: "Blog post created successfully.",
        });
      }
      router.push("/admin");
      router.refresh();
    } catch (error: any) {
      console.error("[v0] Error saving blog:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Failed to save blog post. Please check Firebase configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = (fileToUpload: File) => {
    setUploading(true);
    const path = `covers/${Date.now()}_${fileToUpload.name}`;
    const sRef = storageRef(storage, path);
    const uploadTask = uploadBytesResumable(sRef, fileToUpload);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploadProgress(progress);
      },
      (error) => {
        console.error("[v0] Upload error:", error);
        setUploading(false);
        setUploadProgress(0);
        toast({
          title: "Upload Error",
          description: error.message || "Failed to upload image.",
          variant: "destructive",
        });
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setCoverImage(url);
          toast({
            title: "Upload Complete",
            description: "Image uploaded and applied to cover.",
          });
        } catch (err: any) {
          console.error("[v0] getDownloadURL error:", err);
          toast({
            title: "Error",
            description: err.message || "Failed to get download URL.",
            variant: "destructive",
          });
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) uploadFile(f);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-100 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-serif">
              {blog ? "Edit Blog Post" : "Create New Blog Post"}
            </CardTitle>
            <CardDescription>
              {blog
                ? "Update your article content and settings"
                : "Share insights about AI reverse image search"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="coverImageFile"
              className="text-base font-medium flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              Cover Image
            </Label>

            <div className="flex items-center gap-3">
              <input
                id="coverImageFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
                aria-label="Upload cover image"
              />

              <span className="text-sm text-muted-foreground">
                or paste an image URL below
              </span>
            </div>

            {uploading && (
              <div className="w-full bg-gray-200 rounded overflow-hidden h-3">
                <div
                  className="h-3 bg-purple-600"
                  style={{
                    width: `${uploadProgress}%`,
                    transition: "width 200ms",
                  }}
                />
              </div>
            )}

            <Input
              id="coverImage"
              placeholder="https://example.com/image.jpg or /ai-technology.png"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="h-11"
            />

            {coverImage && (
              <div className="mt-3 rounded-lg overflow-hidden border-2 border-purple-100 bg-gray-50">
                <img
                  src={coverImage || "/placeholder.svg"}
                  alt="Cover preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Upload className="w-3 h-3" />
              Upload an image or provide a public image URL for the cover
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., How to Use AI Reverse Image Search Effectively"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-lg h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-base font-medium">
              Excerpt <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="excerpt"
              placeholder="Write a compelling summary that appears in the blog listing and search results..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This short description helps readers understand what your article
              is about (150-200 characters recommended).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-base font-medium">
              Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Write your detailed blog post content here. Share tips, tutorials, case studies, or insights about AI image search technology..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              required
              className="font-mono text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Write in plain text or markdown format.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author" className="text-base font-medium">
              Author Name
            </Label>
            <Input
              id="author"
              placeholder="Author name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="flex items-center space-x-3 p-5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <Switch
              id="published"
              checked={published}
              onCheckedChange={setPublished}
            />
            <Label htmlFor="published" className="cursor-pointer flex-1">
              <span className="font-semibold text-base">
                Publish immediately
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                Make this post visible to all visitors on your blog
              </p>
            </Label>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t-2 border-purple-100">
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : blog ? "Update Post" : "Create Post"}
            </Button>
            <Button type="button" variant="outline" size="lg" asChild>
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
