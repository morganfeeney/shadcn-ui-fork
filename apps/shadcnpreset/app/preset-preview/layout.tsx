import type { Metadata } from "next"

import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Preset preview",
  robots: {
    index: false,
    follow: false,
  },
}

export default function PresetPreviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
