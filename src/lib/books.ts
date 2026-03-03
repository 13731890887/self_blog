import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Book } from "@/types/book";

const booksDirectory = path.join(process.cwd(), "content/books");

export function getAllBooks(): Book[] {
  if (!fs.existsSync(booksDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(booksDirectory);
  const allBooksData = fileNames
    .filter((fileName) => fileName.endsWith(".mdx") || fileName.endsWith(".md"))
    .map((fileName) => {
      const fullPath = path.join(booksDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      const slug = fileName.replace(/\.(mdx|md)$/, "");

      return {
        slug,
        title: data.title || slug,
        author: data.author || "",
        coverImage: data.coverImage,
        rating: data.rating || 0,
        readDate: data.readDate || new Date().toISOString(),
        tags: data.tags || [],
        excerpt: data.excerpt || "",
        content,
      } as Book;
    });

  return allBooksData.sort((a, b) => {
    return new Date(b.readDate).getTime() - new Date(a.readDate).getTime();
  });
}

export function getBookBySlug(slug: string): Book | null {
  try {
    const fullPath = path.join(booksDirectory, `${slug}.mdx`);
    let fileContents: string;

    if (fs.existsSync(fullPath)) {
      fileContents = fs.readFileSync(fullPath, "utf8");
    } else {
      const mdPath = path.join(booksDirectory, `${slug}.md`);
      if (fs.existsSync(mdPath)) {
        fileContents = fs.readFileSync(mdPath, "utf8");
      } else {
        return null;
      }
    }

    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || slug,
      author: data.author || "",
      coverImage: data.coverImage,
      rating: data.rating || 0,
      readDate: data.readDate || new Date().toISOString(),
      tags: data.tags || [],
      excerpt: data.excerpt || "",
      content,
    } as Book;
  } catch {
    return null;
  }
}

export function getAllBookSlugs(): string[] {
  if (!fs.existsSync(booksDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(booksDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".mdx") || fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.(mdx|md)$/, ""));
}
