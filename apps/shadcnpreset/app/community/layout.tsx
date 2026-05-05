import { PropsWithChildren } from "react"
import { WideLayout } from "@/components/wide-layout"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"

export default function Layout({ children }: PropsWithChildren) {
  return (
    <WideLayout>
      <PageHeader>
        <PageHeaderHeading className="max-w-4xl">
          Community presets
        </PageHeaderHeading>
        <PageHeaderDescription className="text-muted-foreground">
          Explore presets voted for by the community. Find inspiration, remix
          presets, and share your own.
        </PageHeaderDescription>
      </PageHeader>
      {children}
    </WideLayout>
  )
}
