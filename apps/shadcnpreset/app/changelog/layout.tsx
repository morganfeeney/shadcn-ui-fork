import { PropsWithChildren } from "react"

import { DefaultLayout } from "@/components/default-layout"

export default function ChangelogLayout({ children }: PropsWithChildren) {
  return <DefaultLayout>{children}</DefaultLayout>
}
