declare module "*.mdx" {
  import type { ComponentType } from "react"

  export const frontmatter: {
    slug: string
    date: string
    title: string
    description?: string
    [key: string]: unknown
  }

  const MDXComponent: ComponentType
  export default MDXComponent
}
