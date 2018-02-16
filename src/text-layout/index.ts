import * as LineBreaker from "linebreak"

export interface AttributedStyle {
  start: number
  end: number
  style: any
}

export interface TextWithAttributedStyle {
  text: string
  attributedStyles: AttributedStyle[]
}

const max = numbers => numbers.reduce(Math.max, 0)

const lineWidth = (
  backend,
  { text, attributedStyles }: TextWithAttributedStyle
): number =>
  attributedStyles.reduce((x, { start, end, style }, i) => {
    let body = text.slice(start, end)
    // Trim trailling whitespace
    if (i === attributedStyles.length - 1) {
      body = body.replace(/\s+$/, "")
    }
    return x + backend.measureText(body, style)
  }, 0)

export const lineHeight = (line: TextWithAttributedStyle): number =>
  max(line.attributedStyles.map(({ style }) => style.lineHeight))

export const lineFontSize = (line: TextWithAttributedStyle): number =>
  max(line.attributedStyles.map(({ style }) => style.fontSize))

const textSlice = (
  textStyle: TextWithAttributedStyle,
  start: number,
  end: number
): TextWithAttributedStyle => ({
  text: textStyle.text.slice(start, end),
  attributedStyles: textStyle.attributedStyles
    .filter(a => a.end > start && a.start < end)
    .map(a => ({
      start: Math.max(a.start - start, 0),
      end: Math.min(a.end - start, end - start),
      style: a.style
    }))
})

export const breakLines = (
  backend,
  textStyle: TextWithAttributedStyle,
  width: number
): TextWithAttributedStyle[] => {
  const { text, attributedStyles } = textStyle
  const breaker = new LineBreaker(text)

  const lines: TextWithAttributedStyle[] = []
  let lineStart = 0
  let lastPosition = 0
  let lastLine: TextWithAttributedStyle | null = null
  let shouldBreak = false

  let bk: any = breaker.nextBreak()
  while (bk != null) {
    const { position, required } = bk
    const testLine = textSlice(textStyle, lineStart, position)
    if (
      lastLine === null ||
      (!shouldBreak && lineWidth(backend, testLine) <= width)
    ) {
      lastLine = testLine
    } else {
      lines.push(lastLine)
      lineStart = lastPosition
      lastLine = textSlice(textStyle, lineStart, position)
    }
    lastPosition = position
    shouldBreak = required
    bk = breaker.nextBreak()
  }

  if (lastLine !== null) {
    lines.push(lastLine)
  }

  return lines
}

export const measureLines = (backend, lines) => ({
  width: max(lines.map(x => lineWidth(backend, x))),
  height: lines.reduce((a, b) => a + lineHeight(b), 0)
})
