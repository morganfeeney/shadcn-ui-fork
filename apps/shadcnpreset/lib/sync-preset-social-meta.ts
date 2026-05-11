import { siteConfig } from "@/lib/config"
import { buildPresetSocialMetaPayload } from "@/lib/build-preset-social-meta"
import { resolvePresetFromCode } from "@/lib/preset"

function setMetaName(name: string, content: string) {
  let el = document.querySelector(
    `meta[name=${JSON.stringify(name)}][data-preset-managed=true]`
  )

  if (!el) {
    el = document.querySelector(`meta[name=${JSON.stringify(name)}]`)
  }

  if (!el) {
    el = document.createElement("meta")
    el.setAttribute("name", name)
    el.setAttribute("data-preset-managed", "true")
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

/** Updates a stable meta tag without deleting Next-managed nodes. */
function setMetaProperty(property: string, content: string) {
  let el = document.querySelector(
    `meta[property=${JSON.stringify(property)}][data-preset-managed=true]`
  )

  if (!el) {
    el = document.querySelector(`meta[property=${JSON.stringify(property)}]`)
  }

  if (!el) {
    el = document.createElement("meta")
    el.setAttribute("property", property)
    el.setAttribute("data-preset-managed", "true")
    document.head.appendChild(el)
  }

  el.setAttribute("content", content)
}

function setCanonicalLink(href: string) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", "canonical")
    document.head.appendChild(el)
  }
  el.setAttribute("href", href)
}

async function fetchDynamicOgFlag(canonicalCode: string): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/presets/${encodeURIComponent(canonicalCode)}/community-og`,
      { priority: "low" }
    )
    if (!response.ok) {
      return false
    }
    const body = (await response.json()) as { dynamicOg?: boolean }
    return body.dynamicOg === true
  } catch {
    return false
  }
}

/**
 * Keeps `<title>`, canonical, and Open Graph / Twitter tags aligned with the current preset when
 * the URL is updated client-side (`history.replaceState`).
 */
export async function syncPresetPageSocialMeta(presetCode: string) {
  if (typeof document === "undefined") {
    return
  }

  const resolved = resolvePresetFromCode(presetCode)
  if (!resolved) {
    return
  }

  const useDynamicOg = await fetchDynamicOgFlag(resolved.code)

  const payload = buildPresetSocialMetaPayload(
    resolved,
    window.location.origin,
    siteConfig.name,
    useDynamicOg
  )

  document.title = payload.documentTitle

  setMetaName("description", payload.description)
  setMetaProperty("og:title", payload.ogTitle)
  setMetaProperty("og:description", payload.description)
  setMetaProperty("og:url", payload.pageUrl)
  setMetaProperty("og:image", payload.ogImageUrl)
  setMetaProperty("og:image:width", "1200")
  setMetaProperty("og:image:height", "630")
  setMetaName("twitter:card", "summary_large_image")
  setMetaName("twitter:title", payload.ogTitle)
  setMetaName("twitter:description", payload.description)
  setMetaName("twitter:image", payload.ogImageUrl)

  setCanonicalLink(payload.pageUrl)
}
