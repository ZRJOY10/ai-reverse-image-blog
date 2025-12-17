"use client"

import { useEffect, useState } from "react"
import { BlogEditor } from "@/components/blog-editor"
import { AdminGuard } from "@/components/admin-guard"
import { AdminHeader } from "@/components/admin-header"
import { getBlog } from "@/lib/blog-service"
import type { Blog } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBlog = async () => {
      const data = await getBlog(params.id)
      setBlog(data)
      setLoading(false)
    }
    loadBlog()
  }, [params.id])

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Edit Blog Post</h1>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : blog ? (
            <BlogEditor blog={blog} />
          ) : (
            <p className="text-center text-muted-foreground">Blog not found</p>
          )}
        </main>
      </div>
    </AdminGuard>
  )
}
