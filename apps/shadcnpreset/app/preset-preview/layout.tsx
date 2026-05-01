import { Toaster } from "@/components/ui/sonner"

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
