import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

const components = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 style={{ fontFamily: 'var(--font-mono, monospace)', color: '#e2e8f0' }} className="text-3xl font-bold mt-8 mb-4" {...props} />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 style={{ fontFamily: 'var(--font-mono, monospace)', color: '#00d4ff' }} className="text-2xl font-semibold mt-6 mb-3" {...props} />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 style={{ fontFamily: 'var(--font-mono, monospace)', color: '#bf5af2' }} className="text-xl font-semibold mt-4 mb-2" {...props} />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="my-4 leading-7" style={{ color: '#e2e8f0' }} {...props} />
  ),
  a: ({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
    <a className="underline" style={{ color: '#00d4ff' }} {...props} />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside my-4 space-y-2" {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside my-4 space-y-2" {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="ml-4" style={{ color: '#e2e8f0' }} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      style={{
        borderLeft: '3px solid #00d4ff',
        background: 'rgba(0, 212, 255, 0.05)',
        padding: '0.8em 1em',
        margin: '1.6em 0',
        borderRadius: '0 4px 4px 0',
        color: '#7fa3bf',
        fontStyle: 'italic',
      }}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      style={{
        background: '#0d1117',
        borderLeft: '2px solid #00d4ff',
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
        background: 'rgba(0, 212, 255, 0.1)',
        color: '#00d4ff',
        padding: '0.15em 0.4em',
        borderRadius: '3px',
        fontSize: '0.875em',
        fontFamily: 'var(--font-mono, monospace)',
      }}
      className={className}
      {...props}
    />
  ),
  hr: ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr style={{ borderColor: 'rgba(0, 212, 255, 0.2)', margin: '2em 0' }} {...props} />
  ),
  img: ({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img className="rounded my-4 max-w-full h-auto" style={{ border: '1px solid rgba(0, 212, 255, 0.2)' }} {...props} />
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
