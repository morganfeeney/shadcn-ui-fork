/**
 * postMessage type for iframe → parent preset URL sync.
 * Must match `SHADCNPRESET_PRESET_CODE_MESSAGE_TYPE` in shadcnpreset `lib/shadcnpreset-postmessage.ts`.
 */
export const PRESET_CODE_SYNC_MESSAGE_TYPE = "shadcnpreset:preset-code" as const
