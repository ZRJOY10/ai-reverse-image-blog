"use client"

import { use, useEffect, useState } from "react"
import { getBlog } from "@/lib/blog-service"
import type { Blog } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Calendar, User, ImageIcon } from "lucide-react"
import Image from "next/image"
import { CommentsSection } from "@/components/comments-section"

export default function BlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBlog = async () => {
      const data = await getBlog(id)
      setBlog(data)
      setLoading(false)
    }
    loadBlog()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <Link href="/">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Reverse
                </h1>
              </div>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Button
            asChild
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Reverse
              </h1>
            </div>
          </Link>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      {/* Blog Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {blog.coverImage && (
          <div className="relative h-96 rounded-2xl overflow-hidden mb-8 shadow-xl border-4 border-white">
            <Image src={blog.coverImage || "/placeholder.svg"} alt={blog.title} fill className="object-cover" />
          </div>
        )}

        <Card className="p-8 md:p-12 mb-8 bg-white/80 backdrop-blur-sm border-2 border-purple-100">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-balance bg-gradient-to-r from-purple-900 to-pink-900 bg-clip-text text-transparent">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-medium">{blog.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>
                {blog.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed text-pretty">{blog.excerpt}</p>
            <div className="whitespace-pre-wrap leading-relaxed text-pretty">{blog.content}</div>
          </div>
        </Card>

        {/* Comments Section */}
        <CommentsSection blogId={id} />
      </article>
    </div>
  )
}
