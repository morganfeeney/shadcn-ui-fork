import { HomePresetCarouselSkeleton } from "@/components/card-list-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { ContainerOuter } from "@/components/zippystarter/container"
import { HomeHero } from "@/components/home-hero"
import { Footer1 } from "@/components/zippystarter/footer1"
import { Header1 } from "@/components/zippystarter/header1"

export function HomeLoadingState() {
  return (
    <ContainerOuter className="grid min-h-screen grid-rows-[auto_1fr_auto]">
      <Header1 />
      <HomeHero>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-21.5" />
          <Skeleton className="h-9 w-37.5" />
        </div>
      </HomeHero>
      <section className="pt-6 pb-20 md:pt-8 md:pb-28">
        <HomePresetCarouselSkeleton className="w-screen [&_[role=listitem]:first-child]:ml-safe [&_[role=listitem]:last-child]:mr-safe" />
      </section>
      <Footer1 />
    </ContainerOuter>
  )
}
