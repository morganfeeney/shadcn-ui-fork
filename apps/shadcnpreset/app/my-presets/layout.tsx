import { PropsWithChildren, Suspense } from "react"
import { DefaultLayout } from "@/components/default-layout"

export default function MyPresetsLayout({ children }: PropsWithChildren) {
  return (
    <DefaultLayout>
      <Suspense fallback={null}>{children}</Suspense>
    </DefaultLayout>
  )
}
