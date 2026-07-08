declare module "oklume" {
  export type OklumeColor = {
    oklch: string
    rgb: string
    hex: string
    hsl: string
  }

  export type OklumeOptions = {
    mode?: "expanded" | "compact"
    trigger?: string | HTMLElement
    onChange?: (color: OklumeColor) => void
    showPreview?: boolean
    showSliders?: boolean
    showFormats?: Array<"oklch" | "rgb" | "hex" | "hsl"> | false
  }

  export default class Oklume {
    constructor(container: string | HTMLElement, options?: OklumeOptions)
    togglePicker(): void
    setColor(l: number, c: number, h: number): void
    destroy(): void
  }
}
