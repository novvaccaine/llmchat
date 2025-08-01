import type { ReactNode } from "react";
import ShikiHighlighter, { type Element } from "react-shiki";

type CodeHighlightProps = {
  className?: string | undefined;
  children?: ReactNode | undefined;
  node?: Element | undefined;
}

export const CodeHighlight = ({
  // @ts-ignore
  inline,
  className,
  children,
  node,
  ...props
}: CodeHighlightProps) => {
  const match = className?.match(/language-(\w+)/);
  const language = match ? match[1] : undefined;

  return !inline ? (
    <ShikiHighlighter language={language} theme="synthwave-84" {...props}>
      {String(children)}
    </ShikiHighlighter>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};
