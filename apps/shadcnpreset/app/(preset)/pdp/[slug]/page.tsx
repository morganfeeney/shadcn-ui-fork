import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ContainerInner } from "@/components/zippystarter/container"
import { presetDnaMetaDescription } from "@/lib/data/metadata/preset-meta"
import { effectiveHeadingFont, resolvePresetFromCode } from "@/lib/preset"
import { getPresetGoogleFontStylesheetHrefs } from "@/lib/preset-google-fonts"
import { buildRegistryTheme, DEFAULT_CONFIG } from "@/registry/config"

import { DnaAboutSection } from "../../pdp/[slug]/about-section"
import { DnaControls } from "../../pdp/[slug]/dna-controls"
import { DnaRelatedPresetsSection } from "../../pdp/[slug]/related-presets-section"
import { DnaSurface } from "../../pdp/[slug]/dna-surface"

type PdpPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PdpPageProps): Promise<Metadata> {
  const { slug } = await params
  const code = slug.trim()
  const resolved = resolvePresetFromCode(code)

  if (!resolved) {
    notFound()
  }

  return {
    title: `Preset details for ${resolved.code}`,
    description: presetDnaMetaDescription(resolved),
  }
}

export default async function PdpPage({ params }: PdpPageProps) {
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
        <ContainerInner className="grid gap-4">
          <DnaSurface resolved={resolved} registryTheme={registryTheme} />
        </ContainerInner>
        <ContainerInner className="grid gap-6">
          <h2 className="text-2xl font-display font-normal">Preset config</h2>
          <DnaAboutSection resolved={resolved} headingFont={headingFont} />
        </ContainerInner>

        <div className="grid gap-6">
          <ContainerInner>
            <h2 className="text-2xl font-display font-normal">
              Related presets
            </h2>
          </ContainerInner>
          <DnaRelatedPresetsSection resolved={resolved} />
        </div>
      </div>
      <div className="pb-safe sticky bottom-6 z-40 my-10 grid justify-center">
        <DnaControls resolved={resolved} />
      </div>
    </>
  )
}
