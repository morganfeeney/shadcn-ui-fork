import { notFound } from "next/navigation"

import { effectiveHeadingFont, resolvePresetFromCode } from "@/lib/preset"
import { getPresetGoogleFontStylesheetHrefs } from "@/lib/preset-google-fonts"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"
import { DnaSurface } from "./dna-surface"
import { ContainerInner } from "@/components/zippystarter/container"
import { DnaRelatedPresetsSection } from "./related-presets-section"
import { DnaAboutSection } from "./about-section"

type DnaPageProps = {
  params: Promise<{ slug: string }>
}

export default async function DnaPage({ params }: DnaPageProps) {
  const { slug } = await params
  const code = slug.trim()
  const resolved = resolvePresetFromCode(code)

  if (!resolved) {
    notFound()
  }

  const headingFont = effectiveHeadingFont(resolved.font, resolved.fontHeading)
  const fontHrefs = getPresetGoogleFontStylesheetHrefs([
    resolved.font,
    headingFont,
  ])
  const registryTheme = buildRegistryTheme({
    ...DEFAULT_CONFIG,
    baseColor: resolved.baseColor,
    theme: resolved.theme,
    chartColor: resolved.effectiveChartColor,
    menuAccent: resolved.menuAccent,
    menuColor: resolved.menuColor,
    radius: resolved.effectiveRadius,
  })

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      {fontHrefs.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <div className="grid gap-y-20">
        <ContainerInner>
          <DnaSurface resolved={resolved} registryTheme={registryTheme} />
        </ContainerInner>
        <ContainerInner className="grid gap-6">
          <h2 className="text-2xl font-display font-normal tracking-tight">
            About preset: {resolved.code}
          </h2>
          <DnaAboutSection resolved={resolved} headingFont={headingFont} />
        </ContainerInner>

        <div className="grid gap-6">
          <ContainerInner>
            <h2 className="text-2xl font-display font-normal tracking-tight">
              Related presets
            </h2>
          </ContainerInner>
          <DnaRelatedPresetsSection resolved={resolved} />
        </div>
      </div>
    </>
  )
}
