import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { encodePreset } from "shadcn/preset"

import { PresetV4Frame } from "@/components/preset-v4-frame"
import { Container } from "@/components/zippystarter/container"
import { siteConfig } from "@/lib/config"
import { isCommunityPresetCode } from "@/lib/community-presets"
import { presetMetaDescription } from "@/lib/data/metadata/preset-meta"
import { buildPageMetadata, getPresetOgImageUrl } from "@/lib/page-metadata"
import { resolvePresetFromCode } from "@/lib/preset"
import { PresetButtons, PresetCodeTitle } from "./components"
import { PresetPageLiveProvider } from "@/components/preset-page-live-context"

type PresetPageProps = {
  params: Promise<{
    code: string
  }>
  searchParams: Promise<{
    embed?: string
  }>
}

export async function generateMetadata({
  params,
}: PresetPageProps): Promise<Metadata> {
  const { code } = await params
  const preset = resolvePresetFromCode(code)
  if (!preset) {
    notFound()
  }

  const title = `shadcn preset: ${preset.code}`
  const description = presetMetaDescription(preset)
  const pagePath = `/preset/${preset.code}`
  const useDynamicOg = await isCommunityPresetCode(preset.code, code)

  return buildPageMetadata({
    title,
    description,
    path: pagePath,
    socialTitle: `${title} | ${siteConfig.name}`,
    image: useDynamicOg
      ? {
          url: getPresetOgImageUrl(preset.code),
          alt: "shadcn preset preview",
          width: 1200,
          height: 630,
        }
      : undefined,
  })
}

export default async function PresetCodePage({ params }: PresetPageProps) {
  const { code } = await params
  const preset = resolvePresetFromCode(code)

  if (!preset) {
    notFound()
  }

  const canonicalCode = encodePreset(preset)
  const v4BaseUrl = process.env.NEXT_PUBLIC_V4_URL ?? "http://localhost:4000"
  const createDirectUrl = new URL("/create", v4BaseUrl)
  createDirectUrl.searchParams.set("preset", canonicalCode)
  const createIframeUrl = new URL(createDirectUrl.toString())
  createIframeUrl.searchParams.set("embed", "1")
  const previewUrl = new URL("/preview/radix/preview", v4BaseUrl)
  previewUrl.searchParams.set("preset", canonicalCode)

  return (
    <PresetPageLiveProvider initialPresetCode={code}>
      <div className="mx-auto w-full max-w-[2000px]">
        <main className="grid gap-2">
          <Container aria-label="Preset details and actions">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <PresetCodeTitle presetCode={code} />
              <div className="flex items-center gap-2">
                <PresetButtons preset={canonicalCode} />
              </div>
            </div>
          </Container>
          <PresetV4Frame
            className="-mx-2 block h-[calc(100dvh-100px)] w-[calc(100%+16px)] border-0"
            src={createIframeUrl.toString()}
            title={`v4 create preset ${code}`}
          />
        </main>
      </div>
    </PresetPageLiveProvider>
  )
}
