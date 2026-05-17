import { HomeHero } from "@/components/home-hero"
import { HomeHeroButtons, HomePresetCarousel } from "@/app/(home)/components"
import { Features1 } from "@/components/zippystarter/features1"
import { getHomepageFeed } from "@/lib/preset-feed"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import { Header1 } from "@/components/zippystarter/header1"
import { Footer1 } from "@/components/zippystarter/footer1"
import { ContainerOuter } from "@/components/zippystarter/container"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function HomePage() {
  const featuredPresets = await getHomepageFeed(16)

  return (
    <ContainerOuter className="grid min-h-screen grid-rows-[auto_1fr_auto]">
      <Header1 />
      <HomeHero>
        <HomeHeroButtons />
      </HomeHero>
      <section className="pt-6 pb-10 md:pt-8 md:pb-20">
        <HomePresetCarousel
          className="w-screen [&_[role=listitem]:first-child]:ml-safe [&_[role=listitem]:last-child]:mr-safe"
          items={featuredPresets.map((item) => ({
            code: item.code,
            title: item.code,
            description: formatPresetCardDescription(item.config),
          }))}
        />
      </section>
      <Features1 />
      <Footer1 />
    </ContainerOuter>
  )
}
