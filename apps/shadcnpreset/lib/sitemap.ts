type SitemapEntry = {
  loc: string
  lastmod?: string
}

const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>'

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

export function buildUrlSetXml(entries: SitemapEntry[]) {
  const urlNodes = entries
    .map((entry) => {
      const lastModTag = entry.lastmod
        ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>`
        : ""

      return `<url><loc>${escapeXml(entry.loc)}</loc>${lastModTag}</url>`
    })
    .join("")

  return `${XML_DECLARATION}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlNodes}</urlset>`
}

export function buildSitemapIndexXml(entries: SitemapEntry[]) {
  const sitemapNodes = entries
    .map((entry) => {
      const lastModTag = entry.lastmod
        ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>`
        : ""

      return `<sitemap><loc>${escapeXml(entry.loc)}</loc>${lastModTag}</sitemap>`
    })
    .join("")

  return `${XML_DECLARATION}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapNodes}</sitemapindex>`
}
