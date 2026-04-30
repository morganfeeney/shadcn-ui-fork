import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/poc/ui/card"
import { CardHeader } from "@/components/ui/card"

interface TypographySpecimenProps {
  type: "heading" | "body"
  font: string
}

export function TypographySpecimen({ type, font }: TypographySpecimenProps) {
  return (
    <div className="@container">
      <Card className="grid gap-1 @2xs:grid-cols-2">
        <CardContent>
          <div
            className={cn(
              "justify-self-start text-8xl text-[clamp(1rem,50cqi,6rem)] leading-none text-foreground",
              type === "body" && "font-sans",
              type === "heading" && "cn-font-heading"
            )}
          >
            Aa
          </div>
          <div className="-mt-1 grid gap-0.5 capitalize">
            <div className="truncate text-sm text-foreground @2xs:text-base">
              {font}
            </div>
            <div className="truncate text-xs text-muted-foreground">{type}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
