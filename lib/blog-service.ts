import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Blog, Comment } from "./types";

function isPermissionDeniedError(error: any): boolean {
  return (
    error?.code === "permission-denied" ||
    error?.message?.includes("permission-denied")
  );
}

// Blog operations
export async function getBlogs(publishedOnly = true) {
  console.log("[v0] Fetching blogs, publishedOnly:", publishedOnly);
  try {
    const blogsRef = collection(db, "blogs");
    const q = publishedOnly
      ? query(
          blogsRef,
          where("published", "==", true),
          orderBy("createdAt", "desc")
        )
      : query(blogsRef, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);
    console.log("[v0] Successfully fetched", snapshot.docs.length, "blogs");
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
    })) as Blog[];
  } catch (error: any) {
    console.error("[v0] Error fetching blogs:", error);
    if (isPermissionDeniedError(error)) {
      throw new Error(
        "Firebase permission denied. Please configure Firestore security rules. See SETUP_INSTRUCTIONS.md for details."
      );
    }
    throw error;
  }
}

export async function getBlog(id: string) {
  console.log("[v0] Fetching blog with id:", id);
  try {
    const docRef = doc(db, "blogs", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("[v0] Blog found:", id);
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt:
          (docSnap.data().createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt:
          (docSnap.data().updatedAt as Timestamp)?.toDate() || new Date(),
      } as Blog;
    }
    console.log("[v0] Blog not found:", id);
    return null;
  } catch (error: any) {
    console.error("[v0] Error fetching blog:", error);
    if (isPermissionDeniedError(error)) {
      throw new Error(
        "Firebase permission denied. Please configure Firestore security rules. See SETUP_INSTRUCTIONS.md for details."
      );
    }
    throw error;
  }
}

export async function createBlog(
  blog: Omit<Blog, "id" | "createdAt" | "updatedAt">
) {
  console.log("[v0] Creating blog:", blog.title);
  try {
    const blogsRef = collection(db, "blogs");
    const docRef = await addDoc(blogsRef, {
      ...blog,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("[v0] Blog created with id:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("[v0] Error creating blog:", error);
    if (isPermissionDeniedError(error)) {
      throw new Error(
        "Firebase permission denied. Please ensure you're logged in as admin and Firestore security rules are configured correctly."
      );
    }
    throw error;
  }
}

export async function updateBlog(id: string, blog: Partial<Blog>) {
  console.log("[v0] Updating blog:", id);
  try {
    const docRef = doc(db, "blogs", id);
    await updateDoc(docRef, {
      ...blog,
      updatedAt: serverTimestamp(),
    });
    console.log("[v0] Blog updated successfully:", id);
  } catch (error: any) {
    console.error("[v0] Error updating blog:", error);
    if (isPermissionDeniedError(error)) {
      throw new Error(
        "Firebase permission denied. Please ensure you're logged in as admin and Firestore security rules are configured correctly."
      );
    }
    throw error;
  }
}

export async function deleteBlog(id: string) {
  console.log("[v0] Deleting blog:", id);
  try {
    // Delete all comments for this blog first (comments stored as subcollection)
    const commentsRef = collection(db, "blogs", id, "comments");
    const snapshot = await getDocs(commentsRef);
    await Promise.all(snapshot.docs.map((c) => deleteDoc(c.ref)));

    // Delete the blog
    const docRef = doc(db, "blogs", id);
    await deleteDoc(docRef);
    console.log("[v0] Blog deleted successfully:", id);
  } catch (error: any) {
    console.error("[v0] Error deleting blog:", error);
    if (isPermissionDeniedError(error)) {
      throw new Error(
        "Firebase permission denied. Please ensure you're logged in as admin and Firestore security rules are configured correctly."
      );
    }
    throw error;
  }
}

// Comment operations
export async function getComments(blogId: string, includeHidden = false) {
  console.log(
    "[v0] Fetching comments for blog:",
    blogId,
    "includeHidden:",
    includeHidden
  );
  try {
    const commentsRef = collection(db, "blogs", blogId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);
    const allComments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      hidden: (doc.data().hidden as boolean) || false,
      blogId,
    })) as Comment[];

    // Filter out hidden comments unless includeHidden is true
    const filteredComments = includeHidden
      ? allComments
      : allComments.filter((c) => !c.hidden);
    console.log("[v0] Fetched", filteredComments.length, "comments");
    return filteredComments;
  } catch (error: any) {
    console.error("[v0] Error fetching comments:", error);
    if (isPermissionDeniedError(error)) {
      throw new Error(
        "Firebase permission denied. Please configure Firestore security rules."
      );
    }
    throw error;
  }
}

export async function createComment(
  comment: Omit<Comment, "id" | "createdAt">
) {
  console.log("[v0] Creating comment for blog:", comment.blogId);
  try {
    const commentsRef = collection(db, "blogs", comment.blogId, "comments");
    const docRef = await addDoc(commentsRef, {
      author: comment.author,
      content: comment.content,
      hidden: false,
      createdAt: serverTimestamp(),
    });
    console.log("[v0] Comment created with id:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("[v0] Error creating comment:", error);
    if (isPermissionDeniedError(error)) {
      throw new Error(
        "Firebase permission denied. Please configure Firestore security rules to allow comment creation."
      );
    }
    throw error;
  }
}
export async function toggleCommentVisibility(
  blogId: string,
  id: string,
  hidden: boolean
) {
  console.log(
    "[v0] Toggling comment visibility:",
    id,
    "hidden:",
    hidden,
    "blogId:",
    blogId
  );
  try {
    const docRef = doc(db, "blogs", blogId, "comments", id);
    await updateDoc(docRef, { hidden });
    console.log("[v0] Comment visibility toggled successfully");
  } catch (error: any) {
    console.error("[v0] Error toggling comment visibility:", error);
    if (isPermissionDeniedError(error)) {
      throw new Error(
        "Firebase permission denied. Please ensure you're logged in as admin."
      );
    }
    throw error;
  }
}

export async function deleteComment(blogId: string, id: string) {
  console.log("[v0] Deleting comment:", id, "blogId:", blogId);
  try {
    const docRef = doc(db, "blogs", blogId, "comments", id);
    await deleteDoc(docRef);
    console.log("[v0] Comment deleted successfully:", id);
  } catch (error: any) {
    console.error("[v0] Error deleting comment:", error);
    if (isPermissionDeniedError(error)) {
      throw new Error(
        "Firebase permission denied. Please ensure you're logged in as admin."
      );
    }
    throw error;
  }
}
