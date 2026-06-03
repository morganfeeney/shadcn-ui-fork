import type { Metadata } from "next"
import { PropsWithChildren } from "react"
import { WideLayout } from "@/components/wide-layout"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"

const title = "Community presets"
const description =
  "Explore presets voted for by the community. Find inspiration, remix presets, and share your own."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/community",
  },
  openGraph: {
    url: "/community",
  },
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <WideLayout>
      <PageHeader>
        <PageHeaderHeading className="max-w-4xl">{title}</PageHeaderHeading>
        <PageHeaderDescription className="text-muted-foreground">
          {description}
        </PageHeaderDescription>
      </PageHeader>
      {children}
    </WideLayout>
  )
}
