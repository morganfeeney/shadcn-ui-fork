"use client"

import * as React from "react"

import {
  GOOGLE_FONT_QUERY_BY_VALUE,
} from "@/lib/preset-google-fonts"

function ensurePreconnect(url: string) {
  if (document.head.querySelector(`link[rel="preconnect"][href="${url}"]`)) {
    return
  }
  const link = document.createElement("link")
  link.rel = "preconnect"
  link.href = url
  if (url.includes("gstatic")) {
    link.crossOrigin = "anonymous"
  }
  document.head.appendChild(link)
}

export function PresetFontLoader({ fontValues }: { fontValues: string[] }) {
  React.useEffect(() => {
    ensurePreconnect("https://fonts.googleapis.com")
    ensurePreconnect("https://fonts.gstatic.com")

    const uniqueValues = Array.from(
      new Set(fontValues.filter((value) => value && value !== "inherit"))
    )

    for (const value of uniqueValues) {
      const familyQuery =
        GOOGLE_FONT_QUERY_BY_VALUE[
          value as keyof typeof GOOGLE_FONT_QUERY_BY_VALUE
        ]
      if (!familyQuery) {
        continue
      }

      const href = `https://fonts.googleapis.com/css2?family=${familyQuery}&display=swap`
      if (document.head.querySelector(`link[data-preset-font="${value}"]`)) {
        continue
      }

      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = href
      link.setAttribute("data-preset-font", value)
      document.head.appendChild(link)
    }
  }, [fontValues])

  return null
}
