import { lineFontSize, lineHeight } from "../text-layout"
import { Backend } from "./types"

const textAligns = {
  left: 0,
  center: 0.5,
  right: 1
}

export default class CanvasBackend implements Backend {
  ctx: any

  constructor(ctx) {
    this.ctx = ctx
  }

  beginShape() {
    this.ctx.beginPath()
    return this.ctx
  }

  commitShape({ fill, stroke, lineWidth }) {
    const { ctx } = this
    if (fill != null) {
      ctx.fillStyle = fill
      ctx.fill()
    }
    if (stroke != null) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = lineWidth
      ctx.stroke()
    }
  }

  applyTextStyle({
    fontFamily = "Helvetica",
    fontWeight = "normal",
    fontStyle = "normal",
    fontSize = 12
  }) {
    this.ctx.font = `${fontSize}px ${fontWeight} ${fontStyle} ${JSON.stringify(
      fontFamily
    )}`
  }

  fillLines(lines, { top, left, width }) {
    const { textAlign = "left" as string } = lines[0].attributedStyles[0].style
    const { ctx } = this
    const originX = left + width * textAligns[textAlign]

    ctx.textBaseline = "top"
    ctx.textAlign = textAlign

    lines.reduce((y, line) => {
      const { text, attributedStyles } = line
      const originY = y + (lineHeight(line) - lineFontSize(line)) / 2

      const tspans = attributedStyles.reduce((x, { start, end, style }, i) => {
        const body =
          i === attributedStyles.length - 1
            ? text.slice(start, end).replace(/\s*$/, "")
            : text.slice(start, end)
        this.applyTextStyle(style)
        const textWidth = ctx.measureText(text)
        ctx.fillText(body, x, y)
        return x + textWidth
      }, left)

      return y + lineHeight(line)
    }, top)
  }

  measureText(text, style) {
    this.applyTextStyle(style)
    return this.ctx.measureText(text)
  }
}
