import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// Schema: defaults seguros + permitir target/rel/className em links/code.
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      ["target"],
      ["rel"],
    ],
    code: [...(defaultSchema.attributes?.code ?? []), ["className"]],
    span: [["className"]],
  },
};

export function MarkdownRenderer({ children }: { children: string }) {
  return (
    <div className="markdown text-[15px] leading-relaxed [&_p]:my-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-4 [&_h3]:font-semibold [&_h3]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_blockquote]:border-l-2 [&_blockquote]:border-foreground/20 [&_blockquote]:pl-3 [&_blockquote]:text-foreground/80 [&_blockquote]:italic [&_code]:bg-black/[.06] dark:[&_code]:bg-white/[.08] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[.85em] [&_pre]:bg-black/[.06] dark:[&_pre]:bg-white/[.06] [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-auto [&_pre>code]:bg-transparent [&_pre>code]:p-0 [&_a]:underline [&_a]:underline-offset-2 [&_hr]:my-4 [&_hr]:border-foreground/15">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, schema]]}
        components={{
          a: ({ href, children, ...rest }) => (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc" {...rest}>
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
