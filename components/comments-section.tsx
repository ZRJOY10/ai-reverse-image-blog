"use client";

import type React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  createComment,
  deleteComment,
  getComments,
  toggleCommentVisibility,
} from "@/lib/blog-service";
import type { Comment } from "@/lib/types";
import { Eye, EyeOff, MessageSquare, Send, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";

interface CommentsSectionProps {
  blogId: string;
}

export function CommentsSection({ blogId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const loadComments = async () => {
    try {
      const data = await getComments(blogId, !!isAdmin);
      setComments(data);
    } catch (error) {
      console.error("[v0] Error loading comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadComments();
  }, [blogId, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    setLoading(true);
    try {
      await createComment({
        blogId,
        author: author.trim(),
        content: content.trim(),
      });
      setAuthor("");
      setContent("");
      await loadComments();
      toast({
        title: "Success",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      console.error("[v0] Error posting comment:", error);
      toast({
        title: "Error",
        description:
          "Failed to post comment. Please check your Firebase configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (
    commentId: string,
    currentHidden: boolean
  ) => {
    try {
      if (!isAdmin)
        throw new Error("Only admins can change comment visibility");
      await toggleCommentVisibility(blogId, commentId, !currentHidden);
      setComments(
        comments.map((c) =>
          c.id === commentId ? { ...c, hidden: !currentHidden } : c
        )
      );
      toast({
        title: "Success",
        description: `Comment ${
          !currentHidden ? "hidden" : "shown"
        } successfully.`,
      });
    } catch (error) {
      console.error("[v0] Error toggling comment visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update comment visibility.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      if (!isAdmin) throw new Error("Only admins can delete comments");
      await deleteComment(blogId, commentId);
      setComments(comments.filter((c) => c.id !== commentId));
      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });
    } catch (error) {
      console.error("[v0] Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      });
    }
  };

  const visibleComments = isAdmin
    ? comments
    : comments.filter((c) => !c.hidden);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-serif">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          Comments ({visibleComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 bg-accent/50 rounded-lg"
        >
          <div className="space-y-2">
            <Label htmlFor="author">Your Name</Label>
            <Input
              id="author"
              placeholder="Enter your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Comment</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
            />
          </div>
          <Button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={loading}
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Posting..." : "Post Comment"}
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {visibleComments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            visibleComments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 bg-card rounded-lg border relative"
              >
                {user && comment.hidden && (
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    Hidden
                  </Badge>
                )}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {comment.author}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {comment.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleToggleVisibility(
                            comment.id,
                            comment.hidden || false
                          )
                        }
                        title={comment.hidden ? "Show comment" : "Hide comment"}
                      >
                        {comment.hidden ? (
                          <Eye className="w-4 h-4 text-blue-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-amber-600" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete this comment.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(comment.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
