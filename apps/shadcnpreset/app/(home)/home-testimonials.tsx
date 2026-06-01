import { AvatarWithText } from "@/components/zippystarter/avatar-with-text"
import { HomeSection } from "@/app/(home)/home-section"

const TESTIMONIALS = [
  {
    quote: "Brilliant use of presets",
    name: "shadcn",
    src: "/avatars/shadcn.png",
    subtitle: "Creator of shadcn/ui",
  },
  {
    quote:
      "If you want to create a preset in just a few moments using AI, this is exactly the right solution. It's also incredibly cool to explore all the other presets created by the community.",
    name: "Francesco Colombo",
    src: "/avatars/francesco.png",
    subtitle: "UX/UI Designer",
  },
] as const

export function HomeTestimonials() {
  return (
    <HomeSection title="Kind words" subTitle="From the community">
      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,350px),1fr))] gap-4">
        {TESTIMONIALS.map((testimonial) => (
          <article key={testimonial.name} className="grid gap-10 bg-muted p-6">
            <p className="pl-[0.5ch] -indent-[0.5ch] text-base leading-relaxed [hanging-punctuation:first]">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <AvatarWithText
              className="self-end"
              size="md"
              name={testimonial.name}
              src={testimonial.src}
              subtitle={testimonial.subtitle}
            />
          </article>
        ))}
      </div>
    </HomeSection>
  )
}
