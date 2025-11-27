"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize rendering of specific elements if needed
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 text-foreground" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-3 text-foreground" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-2 text-foreground" {...props} />,
          p: ({ node, ...props }) => <p className="mb-2 text-foreground" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 text-foreground" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2 text-foreground" {...props} />,
          li: ({ node, ...props }) => <li className="ml-4 text-foreground" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-foreground" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-border pl-4 italic my-2 text-foreground" {...props} />
          ),
          code: ({ node, ...props }: any) => {
            const isInline = !node?.position || node.position.start.line === node.position.end.line;
            return isInline ? (
              <code className="bg-muted text-foreground px-1 py-0.5 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="block bg-muted text-foreground p-2 rounded text-sm font-mono my-2" {...props} />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
