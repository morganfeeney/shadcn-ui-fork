import { HomeHero } from "@/components/home-hero"
import { HomeHeroButtons, HomePresetCarousel } from "@/app/(home)/components"
import { getHomepageFeed } from "@/lib/preset-feed"
import { formatPresetCardDescription } from "@/lib/preset-card-description"
import { Header1 } from "@/components/zippystarter/header1"
import { Footer1 } from "@/components/zippystarter/footer1"
import { ContainerOuter } from "@/components/zippystarter/container"
import { cacheLife } from "next/cache"
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
import NotoLight from "@/public/marketing/cta/notolight.png"
import NotoDark from "@/public/marketing/cta/notodark.png"
import SeraLight from "@/public/marketing/cta/seralight.png"
import SeraDark from "@/public/marketing/cta/seradark.png"
import WcagLight from "@/public/marketing/cta/wcaglight.png"
import WcagDark from "@/public/marketing/cta/wcagdark.png"
import { AvatarWithText } from "@/components/zippystarter/avatar-with-text"

export default async function HomePage() {
  "use cache"
  cacheLife({ stale: 300, revalidate: 300, expire: 86400 })

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
      <div className="relative z-10 mx-auto grid w-full max-w-400 gap-25 px-safe">
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
            <Image
              className="brightness-400 grayscale dark:brightness-200"
              src="https://images.unsplash.com/photo-1691435828932-911a7801adfb?auto=format&fit=crop&w=1200&h=1200&crop=focalpoint&fp-x=0.25&fp-y=0.35&fp-z=2.8&q=80"
              alt=""
              fill
            />
            <div className="absolute inset-0 bg-purple-700 opacity-25 mix-blend-color" />
            <div className="absolute right-0 bottom-0 h-[90%] w-[90%]">
              <Image src={NotoLight} className="dark:hidden" alt="" fill />
              <Image src={NotoDark} className="hidden dark:block" alt="" fill />
            </div>
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
        <div className="@container">
          <div className="grid text-xl font-medium tracking-tighter @6xl:text-3xl">
            <p className="text-foreground">Kind words</p>
            <p className="text-muted-foreground">From the community</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-10 bg-muted p-6">
              <p className="text-base">“Brilliant use of presets”</p>
              <AvatarWithText
                className="self-end"
                size="md"
                name="shadcn"
                src="/avatars/shadcn.png"
                subtitle="Creator of shadcn/ui"
              />
            </div>
            <div className="grid gap-10 bg-muted p-6">
              <p className="text-base">
                “If you want to create a preset in just a few moments using AI,
                this is exactly the right solution. It’s also incredibly cool to
                explore all the other presets created by the community.”
              </p>
              <AvatarWithText
                className="self-end"
                size="md"
                name="Francesco Colombo"
                src="/avatars/francesco.png"
                subtitle="UX/UI Designer"
              />
            </div>
          </div>
        </div>
        <SplitMedia>
          <div className="relative aspect-square">
            <Image
              className="dark:brightness-200"
              src="https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&h=1200&q=80"
              alt=""
              fill
            />
            <div className="absolute top-[5%] left-[5%] h-[80%] w-[80%]">
              <Image src={SeraLight} className="dark:hidden" alt="" fill />
              <Image src={SeraDark} className="hidden dark:block" alt="" fill />
            </div>
            <div className="absolute right-[7.5%] bottom-[7.5%] h-[45%] w-[36.5%] overflow-hidden rounded-sm border shadow-lg drop-shadow-2xl">
              <Image src={WcagLight} className="dark:hidden" alt="" fill />
              <Image src={WcagDark} className="hidden dark:block" alt="" fill />
            </div>
          </div>
          <SplitMediaContent>
            <SplitMediaHeader>
              <SplitMediaHeading>WCAG compliant presets</SplitMediaHeading>
              <SplitMediaSubHeading>Color contrast ready</SplitMediaSubHeading>
            </SplitMediaHeader>
            <SplitMediaDescription>
              Describe what you’re building or the vibe you want. AI surfaces
              matching presets, shows real components, and helps you choose
              fast. Free for a limited time only.
            </SplitMediaDescription>
            <SplitMediaLink href="/high-contrast-presets">
              Browse compliant presets
            </SplitMediaLink>
          </SplitMediaContent>
        </SplitMedia>
      </div>
      <Footer1 />
    </ContainerOuter>
  )
}
