"use client"

import { BlogEditor } from "@/components/blog-editor"
import { AdminGuard } from "@/components/admin-guard"
import { AdminHeader } from "@/components/admin-header"

export default function NewBlogPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <BlogEditor />
        </main>
      </div>
    </AdminGuard>
  )
}
