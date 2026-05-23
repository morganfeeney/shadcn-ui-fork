import { withContentCollections } from "@content-collections/next"
import createMDX from "@next/mdx"

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
}

const withMDX = createMDX({
  // Use MDX `export const …` for front matter (Next.js docs) so Turbopack never
  // needs non-serializable remark plugins. See:
  // https://nextjs.org/docs/app/guides/mdx#frontmatter
})

// Outer wrapper per Content Collections docs: https://content-collections.dev/docs/quickstart/next
export default withContentCollections(withMDX(nextConfig))
