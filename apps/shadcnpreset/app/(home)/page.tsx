import { HomeHero } from "@/components/home-hero"
import { HomeHeroButtons, HomePresetCarousel } from "@/app/(home)/components"
import { getHomepageFeed } from "@/lib/preset-feed"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import { Header1 } from "@/components/zippystarter/header1"
import { Footer1 } from "@/components/zippystarter/footer1"
import { ContainerOuter } from "@/components/zippystarter/container"
import {
  SplitMedia,
  SplitMediaHeading,
  SplitMediaSubHeading,
  SplitMediaDescription,
  SplitMediaContent,
  SplitMediaHeader,
  SplitMediaLink,
} from "@/components/marketing-cards/split-media"
import Image from "next/image"

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
      <div className="relative z-10 mx-auto grid w-full max-w-400 gap-12 px-safe">
        <SplitMedia>
          <SplitMediaContent>
            <SplitMediaHeader>
              <SplitMediaHeading>
                Find your perfect preset using AI
              </SplitMediaHeading>
              <SplitMediaSubHeading>
                Go beyond clicking random
              </SplitMediaSubHeading>
            </SplitMediaHeader>
            <SplitMediaDescription>
              Describe what you’re building or the vibe you want. AI surfaces
              matching presets, shows real components, and helps you choose
              fast. Free for a limited time only.
            </SplitMediaDescription>
            <SplitMediaLink href="/assistant">
              Ask AI to find your prefect preset
            </SplitMediaLink>
          </SplitMediaContent>
          media
        </SplitMedia>
        <SplitMedia>
          <div className="relative aspect-square">
            <div className="absolute inset-0 z-30 bg-purple-700 opacity-25 mix-blend-color" />
            <Image
              className="brightness-[4] grayscale"
              src="https://images.unsplash.com/photo-1691435828932-911a7801adfb?auto=format&fit=crop&w=1200&h=1200&crop=focalpoint&fp-x=0.25&fp-y=0.35&fp-z=2.8&q=80"
              alt=""
              fill
            />
          </div>
          <SplitMediaContent>
            <SplitMediaHeader>
              <SplitMediaHeading>
                Millions of possible presets
              </SplitMediaHeading>
              <SplitMediaSubHeading>Finally explorable</SplitMediaSubHeading>
            </SplitMediaHeader>
            <SplitMediaDescription>
              Compare presets visually, inspect design decisions, and discover
              styles that match the direction you want to build.
            </SplitMediaDescription>
            <SplitMediaLink href="/community">Browse presets</SplitMediaLink>
          </SplitMediaContent>
        </SplitMedia>
      </div>
      <Footer1 />
    </ContainerOuter>
  )
}
