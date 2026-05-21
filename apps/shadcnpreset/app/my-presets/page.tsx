import { Heart } from "lucide-react"
import { connection } from "next/server"
import { ListView } from "@/components/list-view"
import { toListViewItem } from "@/lib/list-view"
import { MyVotesSignInPrompt } from "@/components/my-votes-sign-in-prompt"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getSessionUser } from "@/lib/auth"
import { getVotedPresetsForUser } from "@/lib/user-votes"
import { SimpleHeader } from "@/app/my-presets/components"

export default async function MyVotesPage() {
  await connection()

  const user = await getSessionUser()

  if (!user) {
    return (
      <>
        <main className="grid gap-4">
          <Empty className="border border-border">
            <EmptyMedia variant="icon">
              <Heart className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle className="text-2xl">No presets yet :(</EmptyTitle>
              <EmptyDescription>
                Sign in to add, view & manage your favourite presets.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <MyVotesSignInPrompt />
            </EmptyContent>
          </Empty>
        </main>
      </>
    )
  }

  const feedItems = await getVotedPresetsForUser(user.id)
  const items = feedItems.map(toListViewItem)

  return (
    <div className="grid grid-rows-[auto_1fr] gap-6">
      <SimpleHeader />
      <main className="grid gap-4">
        {items.length === 0 ? (
          <Empty className="border border-border">
            <EmptyMedia variant="icon">
              <Heart className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle className="text-2xl">No presets yet :(</EmptyTitle>
              <EmptyDescription>
                Explore the home feed and vote for presets you love—they will
                show up here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ListView
            items={items}
            useLiveFeed={false}
            safePage={1}
            totalPages={1}
          />
        )}
      </main>
    </div>
  )
}
