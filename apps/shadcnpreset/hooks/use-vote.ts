"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuthStore } from "@/stores/auth-store"

type VoteStateResponse = {
  votes: number
  hasVoted: boolean
}

type UseVoteOptions = {
  enabled?: boolean
  initialVotes?: number
  initialHasVoted?: boolean
}

export default function useVote(code: string, options: UseVoteOptions = {}) {
  const enabled = options.enabled ?? true
  const ensureAuthForVote = useAuthStore(
    (state) => state.ensureAuthenticatedForVote
  )
  const authStatus = useAuthStore((state) => state.status)
  const queryClient = useQueryClient()
  const hasSeededVoteState =
    options.initialVotes !== undefined && options.initialHasVoted !== undefined
  const shouldFetchVoteState = enabled && !hasSeededVoteState

  const { data } = useQuery({
    queryKey: ["presetVote", code],
    enabled: shouldFetchVoteState,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async (): Promise<VoteStateResponse> => {
      const response = await fetch(`/api/presets/${code}/vote`, {
        method: "GET",
        cache: "no-store",
      })
      if (!response.ok) {
        throw new Error("Failed to fetch vote state")
      }
      return (await response.json()) as VoteStateResponse
    },
  })

  const voteMutation = useMutation({
    mutationFn: async (): Promise<VoteStateResponse> => {
      const response = await fetch(`/api/presets/${code}/vote`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to toggle vote")
      }
      return (await response.json()) as VoteStateResponse
    },
    onSuccess: (payload) => {
      queryClient.setQueryData<VoteStateResponse>(["presetVote", code], payload)
      queryClient.setQueriesData<{
        votesByCode: Record<string, number>
        hasVotedByCode: Record<string, boolean>
        authenticated: boolean
      }>(
        { queryKey: ["presetVotesBatch"] },
        (current) => {
          if (!current || !(code in current.votesByCode) || !(code in current.hasVotedByCode)) {
            return current
          }

          return {
            ...current,
            votesByCode: {
              ...current.votesByCode,
              [code]: payload.votes,
            },
            hasVotedByCode: {
              ...current.hasVotedByCode,
              [code]: payload.hasVoted,
            },
          }
        }
      )
      void queryClient.invalidateQueries({ queryKey: ["presetFeed"] })
    },
  })

  async function toggleVote() {
    if (voteMutation.isPending) {
      return
    }

    const canVote = await ensureAuthForVote(code)
    if (!canVote) {
      return
    }

    await voteMutation.mutateAsync()
  }

  const voteCount = data?.votes ?? options.initialVotes ?? 0
  const hasVoted = data?.hasVoted ?? options.initialHasVoted ?? false

  return {
    toggleVote,
    voteCount,
    isVoting: voteMutation.isPending,
    hasVoted,
    authStatus,
  }
}
