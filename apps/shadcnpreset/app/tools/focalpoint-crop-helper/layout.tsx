import type { Metadata } from "next"
import type { PropsWithChildren } from "react"

import { siteConfig } from "@/lib/config"
import { FOCALPOINT_CROP_TOOL } from "@/app/tools/tools"

export const metadata: Metadata = {
  title: FOCALPOINT_CROP_TOOL.title,
  description: FOCALPOINT_CROP_TOOL.description,
  openGraph: {
    title: `${FOCALPOINT_CROP_TOOL.title} | ${siteConfig.name}`,
    description: FOCALPOINT_CROP_TOOL.description,
    url: FOCALPOINT_CROP_TOOL.href,
    siteName: siteConfig.name,
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: `${FOCALPOINT_CROP_TOOL.title} | ${siteConfig.name}`,
    description: FOCALPOINT_CROP_TOOL.description,
    images: [],
  },
}

export default function FocalpointCropHelperLayout({ children }: PropsWithChildren) {
  return children
}
