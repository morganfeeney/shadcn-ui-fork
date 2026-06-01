import { PropsWithChildren } from "react"

interface HomeSectionProps extends PropsWithChildren {
  title: string
  subTitle: string
}

export function HomeSection({ children, title, subTitle }: HomeSectionProps) {
  return (
    <section className="@container grid gap-7">
      <div className="grid text-xl font-medium tracking-tighter @6xl:text-3xl">
        <p className="text-xl font-medium tracking-tighter text-foreground @6xl:text-3xl @6xl:font-normal">
          {title}
        </p>
        <p className="-mt-0.5 text-xl font-medium tracking-tighter text-muted-foreground @6xl:text-3xl @6xl:font-normal">
          {subTitle}
        </p>
      </div>
      {children}
    </section>
  )
}
