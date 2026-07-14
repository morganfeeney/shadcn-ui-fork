import { describe, expect, it } from "vitest"

import { SHADCNPRESET_PRESET_CODE_MESSAGE_TYPE } from "@/lib/shadcnpreset-postmessage"
import { PRESET_CODE_SYNC_MESSAGE_TYPE } from "../../v4/app/(app)/(create)/components/shadcnpreset-fork/constants"

describe("fork preset postMessage contract", () => {
  it("matches between v4 shadcnpreset-fork and shadcnpreset lib", () => {
    expect(SHADCNPRESET_PRESET_CODE_MESSAGE_TYPE).toBe(
      PRESET_CODE_SYNC_MESSAGE_TYPE
    )
    expect(SHADCNPRESET_PRESET_CODE_MESSAGE_TYPE).toBe("shadcnpreset:preset-code")
  })
})
