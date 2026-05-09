import { compileMDX } from "@content-collections/mdx"
import { defineCollection, defineConfig } from "@content-collections/core"
import { z } from "zod-cc"

const changelogSchema = z.object({
  date: z.string(),
  title: z.string(),
  description: z.string().optional(),
  content: z.string(),
})

const changelog = defineCollection({
  name: "changelog",
  directory: "content/changelog",
  include: "**/*.mdx",
  parser: "frontmatter",
  schema: changelogSchema,
  transform: async (document, ctx) => {
    const body = await compileMDX(ctx, document)
    const { content: _content, ...rest } = document
    return {
      ...rest,
      body,
    }
  },
})

export default defineConfig({
  content: [changelog],
})
