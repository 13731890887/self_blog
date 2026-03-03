import { getAllBooks } from "@/lib/books";
import { BookCard } from "@/components/BookCard";
import { PageHeader } from "@/components/PageHeader";

export default function ReadingPage() {
  const books = getAllBooks();

  return (
    <main style={{ minHeight: "100vh", paddingTop: "56px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
        <PageHeader
          title="阅读"
          subtitle="每本书保留一个最有行动价值的收获"
          path="/reading"
        />

        {books.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {books.map((book) => (
              <BookCard key={book.slug} book={book} />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "14px",
            }}
          >
            {'>'} 还没有读书笔记，在 content/books 目录下添加 MDX 文件即可
          </div>
        )}
      </div>
    </main>
  );
}
