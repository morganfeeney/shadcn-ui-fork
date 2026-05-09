import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Container } from "@/components/zippystarter/container"
import { Image } from "@/components/zippystarter/image"

interface Timeline2Props {
  items: {
    id?: string
    date: string
    title: string
    description: ReactNode
    image?: {
      src: string
      alt?: string
    }
  }[]
  className?: string
  wrapperClassName?: string
}

export function Timeline2({
  items,
  className,
  wrapperClassName,
}: Timeline2Props) {
  return (
    <Container
      className={cn(
        "@container relative mx-auto grid max-w-7xl gap-4 gap-y-0",
        className
      )}
      wrapperClassName={cn(wrapperClassName, "py-24")}
    >
      {items.map(({ id, date, title, description, image }, index) => {
        const lastItem = items.length - 1
        return (
          <div
            key={id ?? `${title}-${index}`}
            className="relative grid grid-cols-[16px_1fr] gap-4 @3xl:grid-cols-[2fr_7%_7fr] @3xl:gap-y-0"
          >
            {/* Date */}
            <div
              className={cn(
                "-mt-[3px] text-left font-mono text-xs font-medium text-muted-foreground uppercase @3xl:col-span-1 @3xl:self-start @3xl:text-right",
                {
                  "@3xl:sticky @3xl:top-2 @3xl:mb-4": index !== lastItem,
                }
              )}
            >
              {date}
            </div>
            {/* Decorative lines */}
            <div className="relative row-start-1 row-end-3 -ml-1 grid justify-center justify-items-center @3xl:[grid-row:unset]">
              {index !== lastItem ? (
                <div className="col-start-1 row-start-1 row-end-3 w-px bg-muted-foreground/25" />
              ) : null}
              <div
                className={cn(
                  "col-start-1 row-span-1 row-start-1 h-2 w-2 rounded-full bg-muted-foreground",
                  {
                    "@3xl:sticky @3xl:top-2.75 @3xl:mb-4 @3xl:self-start":
                      index !== lastItem,
                    "border border-muted-foreground bg-background": index !== 0,
                  }
                )}
              />
            </div>
            {/* Body */}
            <div
              className={cn("grid gap-4", {
                "pb-16 md:pb-20": index !== lastItem,
              })}
            >
              <p className="-mt-2.5 text-sm font-display tracking-tight text-foreground md:text-lg">
                {title}
              </p>
              {image ? (
                <Image
                  src={image.src}
                  alt={image.alt ?? ""}
                  width={660}
                  height={215}
                  className="rounded-lg border"
                />
              ) : null}
              <div className="body-content max-w-[56ch] overflow-hidden text-sm leading-6 text-foreground/70 md:max-w-[66ch] md:text-base md:leading-7">
                {description}
              </div>
            </div>
          </div>
        )
      })}
    </Container>
  )
}
