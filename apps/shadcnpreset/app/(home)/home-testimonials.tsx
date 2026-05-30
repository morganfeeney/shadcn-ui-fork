import { AvatarWithText } from "@/components/zippystarter/avatar-with-text"

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
    <section className="@container grid gap-7">
      <div className="grid text-xl font-medium tracking-tighter @6xl:text-3xl">
        <p className="text-xl font-medium tracking-tighter text-foreground @6xl:text-3xl @6xl:font-normal">
          Kind words
        </p>
        <p className="-mt-0.5 text-xl font-medium tracking-tighter text-muted-foreground @6xl:text-3xl @6xl:font-normal">
          From the community
        </p>
      </div>
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
    </section>
  )
}
