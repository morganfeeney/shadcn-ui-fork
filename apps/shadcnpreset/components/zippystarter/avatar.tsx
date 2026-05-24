import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

const avatarVariants = cva(
  "inline-block overflow-hidden *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:ring-2",
  {
    variants: {
      size: {
        "2xl": "size-20 text-2xl",
        xl: "size-16 text-xl",
        lg: "size-14 text-lg",
        md: "size-12 text-md",
        sm: "size-10 text-sm",
        xs: "size-6 text-xs",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  },
);

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  initials?: string;
  alt?: string;
  className?: string;
  square?: boolean;
  fallbackColor?: {
    background?: string;
    text?: string;
  };
}

export function Avatar({
  src,
  initials,
  alt = "",
  className,
  size = "lg",
  square = false,
  fallbackColor,
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative",
        avatarVariants({
          size,
          className,
        }),
        square ? "rounded-lg" : "rounded-full",
      )}
    >
      <AvatarPrimitive.Image
        data-slot="avatar-image"
        src={src}
        alt={alt}
        className="aspect-square size-full"
      />
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        className={cn(
          "flex size-full items-center justify-center",
          fallbackColor?.background || "bg-accent",
          fallbackColor?.text || "text-accent-foreground",
          square ? "rounded-lg" : "rounded-full",
        )}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
