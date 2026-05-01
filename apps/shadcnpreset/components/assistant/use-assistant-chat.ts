"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePathname } from "next/navigation"

import {
  clearPendingAssistantPrompt,
  readPendingAssistantPrompt,
  writePendingAssistantPrompt,
} from "@/lib/pending-assistant-prompt"
import { trackEvent } from "@/lib/analytics-events"
import type { AssistantTurn } from "@/lib/search/assistant/schema"
import { useAuthStore } from "@/stores/auth-store"

export type ChatMessage =
  | {
      role: "user"
      content: string
    }
  | {
      role: "assistant"
      content: string
      kind: "text"
      followUpQuestions?: string[]
    }
  | {
      role: "assistant"
      kind: "presets"
      content: string
      presets: Extract<AssistantTurn, { phase: "ready" }>["presets"]
    }

export type AssistantChatListItem = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

type AssistantChatDetailResponse = {
  chat?: {
    id: string
    messages: Array<{
      role: "user" | "assistant"
      kind: "text" | "presets"
      content: string
      presets?: Extract<ChatMessage, { role: "assistant"; kind: "presets" }>["presets"]
      followUpQuestions?: string[]
    }>
  }
}

type AssistantSendResponse =
  | (AssistantTurn & { chatId?: string })
  | { error?: string; code?: string; chatId?: string }

function hydrateMessages(
  messages: NonNullable<AssistantChatDetailResponse["chat"]>["messages"]
): ChatMessage[] {
  const hydrated: ChatMessage[] = []

  for (const message of messages) {
    if (message.role === "user") {
      hydrated.push({ role: "user", content: message.content })
      continue
    }

    if (message.kind === "presets" && Array.isArray(message.presets)) {
      hydrated.push({
        role: "assistant",
        kind: "presets",
        content: message.content,
        presets: message.presets,
      })
      continue
    }

    hydrated.push({
      role: "assistant",
      kind: "text",
      content: message.content,
      followUpQuestions:
        message.kind === "text" && Array.isArray(message.followUpQuestions)
          ? message.followUpQuestions.filter((q) => q.trim().length > 0).slice(0, 4)
          : undefined,
    })
  }

  return hydrated
}

export function useAssistantChat() {
  const pathname = usePathname()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [lastTurn, setLastTurn] = React.useState<AssistantTurn | null>(null)
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null)
  const [deletingChatId, setDeletingChatId] = React.useState<string | null>(null)
  const authStatus = useAuthStore((state) => state.status)
  const ensureAuthenticated = useAuthStore((state) => state.ensureAuthenticated)
  const queryClient = useQueryClient()

  const hasInteracted = messages.some((message) => message.role === "user")
  const requiresAuth = authStatus !== "authenticated"

  const recentChatsQuery = useQuery<AssistantChatListItem[], Error>({
    queryKey: ["assistantChats", authStatus],
    enabled: authStatus === "authenticated",
    queryFn: async (): Promise<AssistantChatListItem[]> => {
      const response = await fetch("/api/assistant/chats")
      const payload = (await response.json()) as {
        chats?: AssistantChatListItem[]
      }
      if (!response.ok) {
        throw new Error("Failed to load chats")
      }
      return Array.isArray(payload.chats) ? payload.chats : []
    },
  })

  const activeChatQuery = useQuery<
    AssistantChatDetailResponse["chat"],
    Error
  >({
    queryKey: ["assistantChat", activeChatId],
    enabled: authStatus === "authenticated" && Boolean(activeChatId),
    queryFn: async (): Promise<AssistantChatDetailResponse["chat"]> => {
      const response = await fetch(`/api/assistant/chats/${activeChatId}`)
      const payload = (await response.json()) as AssistantChatDetailResponse
      if (!response.ok || !payload.chat) {
        throw new Error("Could not load this chat. Try again.")
      }
      return payload.chat
    },
  })

  const recentChats = recentChatsQuery.data ?? []
  const isLoadingRecentChats = recentChatsQuery.isLoading

  React.useEffect(() => {
    const pendingPrompt = readPendingAssistantPrompt()
    if (!pendingPrompt) {
      return
    }
    setInput((current) => (current.trim().length ? current : pendingPrompt))
    clearPendingAssistantPrompt()
  }, [])

  React.useEffect(() => {
    if (authStatus !== "authenticated") {
      setMessages([])
      setActiveChatId(null)
    }
  }, [authStatus])

  React.useEffect(() => {
    if (activeChatQuery.isError) {
      setError("Could not load this chat. Try again.")
    }
  }, [activeChatQuery.isError])

  React.useEffect(() => {
    const chat = activeChatQuery.data
    if (!chat) {
      return
    }
    const hydrated = hydrateMessages(chat.messages)
    setMessages(hydrated)
    const latestAssistant = [...hydrated]
      .reverse()
      .find(
        (
          message
        ): message is Extract<ChatMessage, { role: "assistant"; kind: "text" }> =>
          message.role === "assistant" && message.kind === "text"
      )
    if (latestAssistant?.followUpQuestions?.length) {
      setLastTurn({
        phase: "gathering",
        assistantMessage: latestAssistant.content,
        followUpQuestions: latestAssistant.followUpQuestions,
      })
    } else {
      setLastTurn(null)
    }
    setInput("")
    setError(null)
  }, [activeChatQuery.data])

  type SendVars = {
    trimmed: string
    nextMessages: ChatMessage[]
    previousPresetCodes: string[]
    chatId: string | null
  }

  type SendData = {
    response: Response
    data: AssistantSendResponse
    args: SendVars
  }

  type SendContext = {
    previousMessages: ChatMessage[]
    previousInput: string
    requestStartedAt: number
  }

  const sendMutation = useMutation<SendData, Error, SendVars, SendContext>({
    mutationFn: async (args: {
      trimmed: string
      nextMessages: ChatMessage[]
      previousPresetCodes: string[]
      chatId: string | null
    }) => {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: args.chatId ?? undefined,
          messages: args.nextMessages,
          previousPresetCodes: args.previousPresetCodes,
        }),
      })
      const raw = await response.text()
      let parsedData: unknown = {}
      try {
        parsedData = raw ? JSON.parse(raw) : {}
      } catch {
        parsedData = {}
      }
      return { response, data: parsedData as AssistantSendResponse, args }
    },
    onMutate: async (args) => {
      setError(null)
      setPending(true)
      setLastTurn(null)
      setInput("")
      const previousMessages = messages
      setMessages(args.nextMessages)
      return { previousMessages, previousInput: input, requestStartedAt: Date.now() }
    },
    onSuccess: async ({ response, data, args }, _variables, context) => {
      const latencyMs = context
        ? Math.max(0, Date.now() - context.requestStartedAt)
        : 0
      if (
        response.status === 401 &&
        "code" in data &&
        data.code === "auth_required"
      ) {
        setMessages(context?.previousMessages ?? [])
        setInput(args.trimmed)
        await ensureAuthenticated()
        return
      }

      if (!response.ok) {
        trackEvent("ai_assistant_response_error", {
          page_path: pathname,
          latency_ms: latencyMs,
          error_type: `http_${response.status}`,
        })
        setMessages(context?.previousMessages ?? [])
        setInput(args.trimmed)
        setError(
          "error" in data && typeof data.error === "string"
            ? data.error
            : `Request failed (${response.status}) — try again.`
        )
        return
      }

      if (!("phase" in data)) {
        trackEvent("ai_assistant_response_error", {
          page_path: pathname,
          latency_ms: latencyMs,
          error_type: "unexpected_payload",
        })
        setMessages(context?.previousMessages ?? [])
        setInput(args.trimmed)
        setError("Unexpected response — try again.")
        return
      }
      trackEvent("ai_assistant_response_success", {
        page_path: pathname,
        latency_ms: latencyMs,
      })

      if (typeof data.chatId === "string") {
        setActiveChatId(data.chatId)
        await queryClient.invalidateQueries({ queryKey: ["assistantChats"] })
        await queryClient.invalidateQueries({
          queryKey: ["assistantChat", data.chatId],
        })
      }

      if (data.phase === "ready") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            kind: "presets",
            content: data.assistantMessage,
            presets: data.presets,
          },
        ])
        setLastTurn(null)
        return
      }

      setLastTurn(data)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          kind: "text",
          content: data.assistantMessage,
          followUpQuestions: data.followUpQuestions,
        },
      ])
    },
    onError: (_error, _vars, context) => {
      const latencyMs = context
        ? Math.max(0, Date.now() - context.requestStartedAt)
        : undefined
      trackEvent("ai_assistant_response_error", {
        page_path: pathname,
        ...(latencyMs !== undefined ? { latency_ms: latencyMs } : {}),
        error_type: "network_error",
      })
      setMessages(context?.previousMessages ?? [])
      setInput(context?.previousInput ?? "")
      setError("Network error — try again.")
    },
    onSettled: () => {
      setPending(false)
    },
  })

  async function deleteChat(chatId: string) {
    const trimmedId = chatId.trim()
    if (!trimmedId || pending || deletingChatId) return

    setDeletingChatId(trimmedId)
    setError(null)
    try {
      const response = await fetch(`/api/assistant/chats/${trimmedId}`, {
        method: "DELETE",
      })
      const payload = (await response.json()) as {
        error?: string
        code?: string
      }

      if (!response.ok) {
        setError(payload.error ?? "Could not delete chat. Try again.")
        return
      }

      if (activeChatId === trimmedId) {
        setActiveChatId(null)
        setMessages([])
        setLastTurn(null)
        setInput("")
      }

      await queryClient.invalidateQueries({ queryKey: ["assistantChats"] })
      await queryClient.invalidateQueries({
        queryKey: ["assistantChat", trimmedId],
      })
    } catch {
      setError("Network error — try again.")
    } finally {
      setDeletingChatId(null)
    }
  }

  async function sendContent(text: string) {
    const trimmed = text.trim()
    if (!trimmed || pending) return
    const hasPreviousUserMessage = messages.some((message) => message.role === "user")
    trackEvent("ai_assistant_prompt_submit", {
      page_path: pathname,
      assistant_prompt: trimmed,
      prompt_length: trimmed.length,
      intent: hasPreviousUserMessage ? "preset_refinement" : "preset_discovery",
    })

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }]
    const previousPresetMessage = [...messages]
      .reverse()
      .find(
        (
          message
        ): message is Extract<ChatMessage, { role: "assistant"; kind: "presets" }> =>
          message.role === "assistant" &&
          message.kind === "presets" &&
          Boolean(message.presets?.length)
      )
    const previousPresetCodes = previousPresetMessage?.presets?.map((p) => p.code) ?? []

    await sendMutation.mutateAsync({
      trimmed,
      nextMessages,
      previousPresetCodes,
      chatId: activeChatId,
    })
  }

  async function onPromptSubmit(text: string) {
    if (requiresAuth) {
      writePendingAssistantPrompt(text)
      await ensureAuthenticated()
      return
    }
    await sendContent(text)
  }

  function startNewChat() {
    if (pending) {
      return
    }
    setActiveChatId(null)
    setMessages([])
    setInput("")
    setError(null)
    setLastTurn(null)
  }

  return {
    activeChatId,
    activeChatQuery,
    deletingChatId,
    deleteChat,
    error,
    hasInteracted,
    input,
    lastTurn,
    messages,
    pending,
    recentChats,
    isLoadingRecentChats,
    setActiveChatId,
    setInput,
    sendContent,
    onPromptSubmit,
    startNewChat,
  }
}
