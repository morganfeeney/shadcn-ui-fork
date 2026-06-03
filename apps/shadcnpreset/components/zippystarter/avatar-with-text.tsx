import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { Avatar } from "@/components/zippystarter/avatar"
import Link from "next/link"

const avatarWithTextVariants = cva("grid grid-cols-[auto_1fr] items-center", {
  variants: {
    size: {
      "2xl": "gap-6 text-base",
      xl: "gap-4 text-base",
      lg: "gap-4 text-sm",
      md: "gap-3 text-sm",
      sm: "gap-4 text-sm",
      xs: "gap-1 text-xs",
    },
  },
  defaultVariants: {
    size: "sm",
  },
})

export interface AvatarWithTextProps extends VariantProps<
  typeof avatarWithTextVariants
> {
  name: string
  subtitle?: string
  href?: string
  src?: string
  className?: string
  alt?: string
}

export function AvatarWithText({
  name,
  subtitle,
  href,
  src,
  size = "sm",
  className,
  alt,
}: AvatarWithTextProps) {
  return (
    <div className={cn(avatarWithTextVariants({ size, className }))}>
      <Avatar size={size} src={src} alt={alt} />
      <div className="overflow-hidden">
        {href ? (
          <Link
            href={href}
            className="truncate underline decoration-background decoration-1 underline-offset-4 transition-all hover:decoration-foreground"
          >
            {name}
          </Link>
        ) : (
          <p
            className={cn("truncate", {
              "text-muted-foreground": size === "xs",
              "text-foreground": size !== "xs",
            })}
          >
            {name}
          </p>
        )}
        {size !== "xs" ? (
          <p className="truncate text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}
