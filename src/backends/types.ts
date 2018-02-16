export interface Backend {
  beginShape: () => void
  commitShape: (
    params: { fill?: string; stroke?: string; lineWidth?: number }
  ) => void
  // TODO: Begin transform groups
  measureText: (
    text: string,
    params: {
      fontFamily?: string
      fontWeight?: string
      fontStyle?: string
      fontSize?: number
    }
  ) => number
}
