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
            color: star <= rating ? '#00d4ff' : '#7fa3bf',
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
          background: '#0d1117',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '4px',
          padding: '24px',
          transition: 'all 0.2s ease',
          height: '100%',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = 'rgba(0, 212, 255, 0.5)';
          el.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.borderColor = 'rgba(0, 212, 255, 0.2)';
          el.style.boxShadow = 'none';
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
            fontSize: '18px',
            fontWeight: 600,
            color: '#e2e8f0',
            marginBottom: '6px',
          }}
        >
          {book.title}
        </h3>
        <p style={{ fontSize: '13px', color: '#7fa3bf', marginBottom: '12px' }}>
          {book.author}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <StarRating rating={book.rating} />
          <span style={{ fontSize: '12px', color: '#7fa3bf' }}>{book.readDate}</span>
        </div>
        <p style={{ fontSize: '14px', color: '#7fa3bf', marginBottom: '12px', lineHeight: 1.6 }}>
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
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '2px',
                  color: '#00d4ff',
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
