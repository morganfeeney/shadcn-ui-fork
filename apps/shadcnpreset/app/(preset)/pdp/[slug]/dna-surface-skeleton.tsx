import { Skeleton } from "@/components/ui/skeleton"

export function DnaSurfaceSkeleton() {
  return (
    <div className="grid gap-4 **:data-[slot=skeleton]:bg-[oklch(0.97_0_0)] dark:**:data-[slot=skeleton]:bg-[oklch(0.269_0_0)]">
      {/*<header className="grid gap-6 pt-30 pb-10">*/}
      {/*  <div className="flex flex-wrap items-center justify-between gap-4">*/}
      {/*    <Skeleton className="h-14 w-[360px]" />*/}
      {/*  </div>*/}
      {/*  <div className="grid max-w-[70ch] gap-2">*/}
      {/*    <Skeleton className="h-4 w-full" />*/}
      {/*    <Skeleton className="h-4 w-[92%]" />*/}
      {/*    <Skeleton className="h-4 w-[78%]" />*/}
      {/*  </div>*/}
      {/*</header>*/}
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-[420px] w-full" />
          <Skeleton className="h-[420px] w-full" />
        </div>
        <Skeleton className="aspect-video w-full" />
      </div>
    </div>
  )
}
