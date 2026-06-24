"use client"

import { create } from "zustand"

import { authClient } from "@/lib/auth-client"
import {
  clearPendingVote,
  writePendingVote,
} from "@/lib/pending-vote"

let bootstrapSessionPromise: Promise<void> | null = null

export type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

type AuthStatus = "unknown" | "authenticated" | "anonymous"
type OAuthProvider = "google" | "github"

type AuthStore = {
  user: SessionUser | null
  status: AuthStatus
  dialogOpen: boolean
  isSubmitting: boolean
  submittingProvider: OAuthProvider | null
  authError: string
  bootstrapSession: () => Promise<void>
  beginOAuth: (provider: OAuthProvider) => Promise<void>
  endOAuth: () => void
  ensureAuthenticated: () => Promise<boolean>
  /** For voting: persists intent in sessionStorage across OAuth so the vote runs after sign-in. */
  ensureAuthenticatedForVote: (presetCode: string) => Promise<boolean>
  closeDialog: () => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  status: "unknown",
  dialogOpen: false,
  isSubmitting: false,
  submittingProvider: null,
  authError: "",

  bootstrapSession: async () => {
    if (get().status !== "unknown") {
      return
    }

    if (bootstrapSessionPromise) {
      return bootstrapSessionPromise
    }

    bootstrapSessionPromise = (async () => {
      try {
        const result = await authClient.getSession()
        const payload = result.data
        set({
          user:
            payload?.user && "id" in payload.user
              ? (payload.user as SessionUser)
              : null,
          status: payload?.user && "id" in payload.user ? "authenticated" : "anonymous",
        })
      } catch {
        set({ user: null, status: "anonymous" })
      } finally {
        bootstrapSessionPromise = null
      }
    })()

    return bootstrapSessionPromise
  },

  beginOAuth: async (provider) => {
    set({ isSubmitting: true, submittingProvider: provider, authError: "" })
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: window.location.href,
      })
    } catch {
      set({
        isSubmitting: false,
        submittingProvider: null,
        authError: "Could not sign in right now. Please try again.",
      })
    }
  },

  endOAuth: () => {
    set({ isSubmitting: false, submittingProvider: null })
  },

  ensureAuthenticated: async () => {
    if (get().status === "unknown") {
      await get().bootstrapSession()
    }
    if (get().status === "authenticated") {
      return true
    }
    set({ dialogOpen: true, authError: "" })
    return false
  },

  ensureAuthenticatedForVote: async (presetCode: string) => {
    if (get().status === "unknown") {
      await get().bootstrapSession()
    }
    if (get().status === "authenticated") {
      return true
    }
    writePendingVote(presetCode)
    set({ dialogOpen: true, authError: "" })
    return false
  },

  closeDialog: () => {
    clearPendingVote()
    set({
      dialogOpen: false,
      authError: "",
      isSubmitting: false,
      submittingProvider: null,
    })
  },

  signOut: async () => {
    clearPendingVote()
    await authClient.signOut()
    set({
      user: null,
      status: "anonymous",
      dialogOpen: false,
      authError: "",
      isSubmitting: false,
      submittingProvider: null,
    })
  },
}))
