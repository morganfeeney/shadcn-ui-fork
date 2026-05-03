import { HomeHero } from "@/components/home-hero"
import { HomeHeroButtons, HomePresetCarousel } from "@/app/(home)/components"
import { Features1 } from "@/components/zippystarter/features1"
import { getHomepageFeed } from "@/lib/preset-feed"
import { Header1 } from "@/components/zippystarter/header1"
import { Footer1 } from "@/components/zippystarter/footer1"
import { ContainerOuter } from "@/components/zippystarter/container"

export const dynamic = "force-dynamic"
export const revalidate = 0

function formatTypographyLine(fontHeading: string, font: string) {
  if (fontHeading === "inherit" || fontHeading === font) {
    return `${font} font`
  }
  return `${fontHeading} & ${font} fonts`
}

export default async function HomePage() {
  const featuredPresets = await getHomepageFeed(16)

  return (
    <ContainerOuter className="grid min-h-screen grid-rows-[auto_1fr_auto]">
      <Header1 />
      <HomeHero>
        <HomeHeroButtons />
      </HomeHero>
      <section className="pt-6 pb-20 md:pt-8 md:pb-28">
        <HomePresetCarousel
          className="mx-safe w-screen"
          items={featuredPresets.map((item) => ({
            code: item.code,
            title: item.code,
            description: `${item.config.baseColor} base, ${item.config.theme} theme, ${item.config.chartColor ?? item.config.theme} charts, ${item.config.iconLibrary}, ${formatTypographyLine(item.config.fontHeading, item.config.font)}`,
          }))}
        />
      </section>
      <Features1 />
      <Footer1 />
    </ContainerOuter>
  )
}
