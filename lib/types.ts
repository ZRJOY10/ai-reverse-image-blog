export interface Blog {
  id: string
  title: string
  content: string
  excerpt: string
  coverImage: string
  author: string
  createdAt: Date
  updatedAt: Date
  published: boolean
}

export interface Comment {
  id: string
  blogId: string
  author: string
  content: string
  createdAt: Date
  hidden?: boolean
}

export interface User {
  id: string
  email: string
  isAdmin: boolean
}
