import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ContainerInner } from "@/components/zippystarter/container"
import { isCommunityPresetCode } from "@/lib/community-presets"
import { presetDnaMetaDescription } from "@/lib/data/metadata/preset-meta"
import { buildPageMetadata, getPresetOgImageUrl } from "@/lib/page-metadata"
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

  const title = `Preset details for ${resolved.code}`
  const description = presetDnaMetaDescription(resolved)
  const pagePath = `/pdp/${resolved.code}`
  const useDynamicOg = await isCommunityPresetCode(resolved.code, code)

  return buildPageMetadata({
    title,
    description,
    path: pagePath,
    image: useDynamicOg
      ? {
          url: getPresetOgImageUrl(resolved.code),
          alt: "shadcn preset preview",
          width: 1200,
          height: 630,
        }
      : undefined,
  })
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

  const dnaDescription = presetDnaMetaDescription(resolved)

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
          <header className="grid gap-6 pt-20 pb-10 md:pt-30">
            <h1 className="text-4xl font-display font-normal md:text-5xl">
              Preset: {resolved.code}
            </h1>
            <p className="max-w-[70ch] text-sm leading-relaxed text-balance text-muted-foreground">
              {dnaDescription}
            </p>
          </header>
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
