"use client";

import { Copy } from "lucide-react";

import { Check } from "lucide-react";

import { buttonVariants } from "fumadocs-ui/components/ui/button";

import { cn } from "fumadocs-ui/utils/cn";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { useState } from "react";

const cache = new Map<string, string>();

export function LLMCopyButton({ slug }: { slug: string[] }) {
  const [isLoading, setLoading] = useState(false);
  const [checked, onClick] = useCopyButton(async () => {
    setLoading(true);

    const url = `/llms.mdx/${slug.join("/")}`;

    try {
      const content: string =
        cache.get(url) ?? (await fetch(url).then((res) => res.text()));

      cache.set(url, content);
      await navigator.clipboard.writeText(content);
    } finally {
      setLoading(false);
    }
  });

  return (
    <button
      disabled={isLoading}
      className={cn(
        buttonVariants({
          color: "secondary",
          size: "sm",
          className: "gap-2",
        })
      )}
      onClick={onClick}
    >
      {checked ? <Check className='size-3.5' /> : <Copy className='size-3.5' />}
      Copy Markdown
    </button>
  );
}
