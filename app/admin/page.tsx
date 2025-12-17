"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "@/components/admin-guard"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getBlogs, deleteBlog } from "@/lib/blog-service"
import type { Blog } from "@/lib/types"
import { Plus, Edit, Trash2, Eye, Search, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
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
} from "@/components/ui/alert-dialog"

export default function AdminDashboard() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadBlogs = async () => {
    try {
      const data = await getBlogs(false)
      setBlogs(data)
      setFilteredBlogs(data)
      setError(null)
    } catch (error: any) {
      console.error("[v0] Admin dashboard error:", error)
      setError(error.message || "Failed to load blogs")
      toast({
        title: "Error",
        description: error.message || "Failed to load blogs.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBlogs()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBlogs(blogs)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = blogs.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          blog.excerpt.toLowerCase().includes(query) ||
          blog.author.toLowerCase().includes(query),
      )
      setFilteredBlogs(filtered)
    }
  }, [searchQuery, blogs])

  const handleDelete = async (id: string) => {
    try {
      await deleteBlog(id)
      setBlogs(blogs.filter((blog) => blog.id !== id))
      toast({
        title: "Success",
        description: "Blog post deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog post.",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Content Dashboard
                </h1>
                <p className="text-muted-foreground">Create, edit, and manage your AI Reverse Image blog content</p>
              </div>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
              >
                <Link href="/admin/blog/new">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Post
                </Link>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-100">
                <CardHeader className="pb-3">
                  <CardDescription>Total Posts</CardDescription>
                  <CardTitle className="text-3xl font-bold text-purple-600">{blogs.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-pink-100">
                <CardHeader className="pb-3">
                  <CardDescription>Published</CardDescription>
                  <CardTitle className="text-3xl font-bold text-pink-600">
                    {blogs.filter((b) => b.published).length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-100">
                <CardHeader className="pb-3">
                  <CardDescription>Drafts</CardDescription>
                  <CardTitle className="text-3xl font-bold text-blue-600">
                    {blogs.filter((b) => !b.published).length}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search posts by title, excerpt, or author..."
                className="pl-10 h-12 bg-white/90 backdrop-blur-sm border-2 border-purple-100 focus:border-purple-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Found {filteredBlogs.length} {filteredBlogs.length === 1 ? "post" : "posts"}
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Firebase Configuration Error</AlertTitle>
              <AlertDescription>
                {error}
                <br />
                <br />
                Please check SETUP_INSTRUCTIONS.md for help configuring Firebase security rules.
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-muted-foreground mt-4">Loading blogs...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <Card className="text-center py-12 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                {searchQuery ? (
                  <>
                    <p className="text-muted-foreground mb-4">No posts found matching "{searchQuery}"</p>
                    <Button variant="outline" onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-4">No blog posts yet. Create your first one!</p>
                    <Button asChild>
                      <Link href="/admin/blog/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Post
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredBlogs.map((blog) => (
                <Card
                  key={blog.id}
                  className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-2 border-purple-100"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl font-serif">{blog.title}</CardTitle>
                          <Badge
                            variant={blog.published ? "default" : "secondary"}
                            className={blog.published ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
                          >
                            {blog.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{blog.excerpt}</CardDescription>
                        <p className="text-sm text-muted-foreground mt-2">
                          By {blog.author} • {blog.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/blog/${blog.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/blog/${blog.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the blog post and all its
                                comments.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(blog.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  )
}
