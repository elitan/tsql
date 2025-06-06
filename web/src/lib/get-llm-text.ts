import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import { remarkInstall } from "fumadocs-docgen";
import { source } from "./source";
import type { InferPageType } from "fumadocs-core/source";

const processor = remark()
  .use(remarkMdx)
  // Include the same plugins as in your source.config.ts
  .use(remarkInstall)
  .use(remarkGfm);

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await processor.process({
    path: page.data._file.absolutePath,
    value: page.data.content,
  });

  return `# ${page.data.title}
URL: ${page.url}

${page.data.description || ""}

${processed.value}`;
}
