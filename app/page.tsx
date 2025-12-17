"use client"

import { useState, useEffect } from "react"
import { getBlogs } from "@/lib/blog-service"
import type { Blog } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { Calendar, User, ArrowRight, Lock, Search, Sparkles, ImageIcon, Zap, AlertCircle } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const data = await getBlogs(true)
        setBlogs(data)
        setFilteredBlogs(data)
        setError(null)
      } catch (err: any) {
        console.error("[v0] Failed to load blogs:", err)
        setError(err.message || "Failed to load blogs. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
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
          blog.content.toLowerCase().includes(query) ||
          blog.author.toLowerCase().includes(query),
      )
      setFilteredBlogs(filtered)
    }
  }, [searchQuery, blogs])

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
            <Link href="/admin/login">
              <Lock className="w-4 h-4 mr-2" />
              Admin Login
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl"></div>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-purple-200 mb-6">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Powered by AI Technology
          </span>
        </div>
        <h2 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 text-balance">
          Explore Billions Of Images
          <br />
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            From All Around The Web
          </span>
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty mb-12 leading-relaxed">
          Discover insights, tutorials, and stories about AI-powered reverse image search technology. Learn how to find
          image sources, detect duplicates, and explore the web visually.
        </p>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles, topics, or keywords..."
              className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 border-purple-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-2 border-purple-100 bg-white/60 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Image Search</h3>
              <p className="text-sm text-muted-foreground">Find the source and context of any image on the web</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-100 bg-white/60 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Powered</h3>
              <p className="text-sm text-muted-foreground">Advanced algorithms for accurate image recognition</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-100 bg-white/60 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Get results in seconds with our optimized search</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Latest Articles & Guides</h3>
          {searchQuery && (
            <p className="text-muted-foreground">
              Found {filteredBlogs.length} {filteredBlogs.length === 1 ? "article" : "articles"} matching "{searchQuery}
              "
            </p>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Firebase Configuration Required</AlertTitle>
            <AlertDescription className="mt-2">
              {error}
              <br />
              <br />
              <strong>Quick Fix:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>Go to Firebase Console → Firestore Database → Rules</li>
                <li>Update the security rules to allow read/write access</li>
                <li>See SETUP_INSTRUCTIONS.md in your project for detailed steps</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-muted-foreground mt-4">Loading blog posts...</p>
          </div>
        ) : filteredBlogs.length === 0 && !error ? (
          <Card className="text-center py-12 max-w-2xl mx-auto bg-white/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              {searchQuery ? (
                <>
                  <p className="text-muted-foreground text-lg mb-4">
                    No articles found matching "{searchQuery}". Try different keywords!
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-lg">No blog posts published yet. Check back soon!</p>
              )}
            </CardContent>
          </Card>
        ) : !error ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <Card
                key={blog.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group border-2 border-purple-100 bg-white/80 backdrop-blur-sm"
              >
                {blog.coverImage && (
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                    <Image
                      src={blog.coverImage || "/placeholder.svg"}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl font-serif line-clamp-2 text-balance">{blog.title}</CardTitle>
                  <CardDescription className="line-clamp-3 text-pretty">{blog.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{blog.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Link href={`/blog/${blog.id}`}>
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 AI Reverse Image Search Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
