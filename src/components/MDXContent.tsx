/* eslint-disable @next/next/no-img-element */
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-primary)' }} className="text-3xl font-bold mt-8 mb-4" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--cyan)' }} className="text-2xl font-semibold mt-6 mb-3" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--purple)' }} className="text-xl font-semibold mt-4 mb-2" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="my-4 leading-7" style={{ color: 'var(--text-primary)' }} {...props} />
  ),
  a: (props: React.HTMLAttributes<HTMLAnchorElement>) => (
    <a className="underline" style={{ color: 'var(--cyan)' }} {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside my-4 space-y-2" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside my-4 space-y-2" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="ml-4" style={{ color: 'var(--text-primary)' }} {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      style={{
        borderLeft: '3px solid var(--cyan)',
        background: 'rgba(94, 194, 183, 0.08)',
        padding: '0.8em 1em',
        margin: '1.6em 0',
        borderRadius: '0 4px 4px 0',
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
      }}
      {...props}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      style={{
        background: 'var(--bg-secondary)',
        borderLeft: '2px solid var(--cyan)',
        borderRadius: '0 4px 4px 0',
        padding: '1em 1.2em',
        overflowX: 'auto',
        margin: '1.6em 0',
        fontFamily: 'var(--font-mono, monospace)',
      }}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      style={{
        background: 'rgba(94, 194, 183, 0.12)',
        color: 'var(--cyan)',
        padding: '0.15em 0.4em',
        borderRadius: '3px',
        fontSize: '0.875em',
        fontFamily: 'var(--font-mono, monospace)',
      }}
      className={className}
      {...props}
    />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr style={{ borderColor: 'rgba(94, 194, 183, 0.2)', margin: '2em 0' }} {...props} />
  ),
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={alt ?? ""} className="rounded my-4 max-w-full h-auto" style={{ border: '1px solid rgba(94, 194, 183, 0.22)' }} {...props} />
  ),
};

interface MDXContentProps {
  content: string;
}

export function MDXContent({ content }: MDXContentProps) {
  return (
    <MDXRemote
      source={content}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, rehypeHighlight],
        },
      }}
      components={components}
    />
  );
}
