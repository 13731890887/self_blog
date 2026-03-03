"use client";

import Link from "next/link";
import { Book } from "@/types/book";

interface BookCardProps {
  book: Book;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            color: star <= rating ? 'var(--purple)' : 'var(--text-secondary)',
            fontSize: '14px',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/reading/${book.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(94, 194, 183, 0.22)',
          borderRadius: '8px',
          padding: '24px',
          transition: 'all 0.2s ease',
          height: '100%',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = 'rgba(94, 194, 183, 0.48)';
          el.style.boxShadow = '0 0 20px rgba(94, 194, 183, 0.1)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = 'rgba(94, 194, 183, 0.22)';
          el.style.boxShadow = 'none';
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '6px',
          }}
        >
          {book.title}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          {book.author}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <StarRating rating={book.rating} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{book.readDate}</span>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.6 }}>
          {book.excerpt}
        </p>
        {book.tags && book.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {book.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  border: '1px solid rgba(94, 194, 183, 0.3)',
                  borderRadius: '2px',
                  color: 'var(--cyan)',
                  fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
