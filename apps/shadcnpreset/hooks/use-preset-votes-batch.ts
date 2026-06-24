"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth-store"

type PresetVotesBatchResponse = {
  votesByCode: Record<string, number>
  hasVotedByCode: Record<string, boolean>
  authenticated: boolean
}

type CodeLike = {
  code: string
}

export function usePresetVotesBatch(codes: string[], enabled = true) {
  const authStatus = useAuthStore((state) => state.status)
  const normalizedCodes = useMemo(
    () => [...new Set(codes.map((code) => code.trim()).filter(Boolean))].slice(0, 120),
    [codes]
  )

  const codeParam = normalizedCodes.join(",")

  return useQuery({
    queryKey: ["presetVotesBatch", codeParam, authStatus],
    enabled: enabled && normalizedCodes.length > 0,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async (): Promise<PresetVotesBatchResponse> => {
      const response = await fetch(
        `/api/presets/votes?codes=${encodeURIComponent(codeParam)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch vote counts")
      }

      return (await response.json()) as PresetVotesBatchResponse
    },
  })
}

export function usePresetVoteMapsForItems<T extends CodeLike>(items: T[]) {
  const itemCodes = useMemo(() => items.map((item) => item.code), [items])
  const votesQuery = usePresetVotesBatch(itemCodes, itemCodes.length > 0)

  return {
    votesByCode: votesQuery.data?.votesByCode ?? {},
    hasVotedByCode: votesQuery.data?.hasVotedByCode ?? {},
  }
}
