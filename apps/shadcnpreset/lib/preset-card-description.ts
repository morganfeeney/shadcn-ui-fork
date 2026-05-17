type PresetCardDescriptionConfig = {
  style: string
  baseColor: string
  theme: string
  chartColor?: string | null
  iconLibrary: string
  font: string
  fontHeading: string
}

export function formatPresetTypographyLine(
  fontHeading: string,
  font: string
): string {
  if (fontHeading === "inherit" || fontHeading === font) {
    return `${font} font`
  }

  return `${fontHeading} & ${font} fonts`
}

export function formatPresetCardDescription(
  config: PresetCardDescriptionConfig
): string {
  const chartColor = config.chartColor ?? config.theme
  const typography = formatPresetTypographyLine(config.fontHeading, config.font)

  const parts = [
    `${config.style} style`,
    `${config.baseColor} base`,
    `${config.theme} theme`,
    `${chartColor} charts`,
    config.iconLibrary,
    typography,
  ]

  return parts.join(", ")
}
