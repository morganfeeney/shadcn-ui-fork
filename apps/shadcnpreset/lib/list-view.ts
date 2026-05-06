import type { PresetConfig } from "shadcn/preset"

import type { PresetPageItem } from "@/lib/preset-catalog"

export type ListViewItem = {
  code: string
  baseColor: string
  theme: string
  chartColor: string
  iconLibrary: string
  font: string
  fontHeading: string
  style: string
}

export function listViewItemFromPresetConfig(
  code: string,
  config: PresetConfig
): ListViewItem {
  return {
    code,
    baseColor: config.baseColor,
    theme: config.theme,
    chartColor: config.chartColor ?? config.theme,
    iconLibrary: config.iconLibrary,
    font: config.font,
    fontHeading: config.fontHeading,
    style: config.style,
  }
}

export function toListViewItem(item: PresetPageItem): ListViewItem {
  return listViewItemFromPresetConfig(item.code, item.config)
}
