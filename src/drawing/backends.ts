import * as cheerio from "cheerio"
import { path } from "d3-path"
import { fontForStyle } from "../fonts"

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

export class CanvasBackend implements Backend {
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

  fillLines(lines) {
    const { ctx } = this

    this.applyTextStyle(style)
    lines.reduce((y, line) => {
      const { text, attributedStyles } = line
      const originY =
        y +
        lineBaseline(fontState, line) +
        (lineHeight(line) - lineFontSize(line)) / 2

      const tspans = attributedStyles.reduce((x, { start, end, style }, i) => {
        const body =
          i === attributedStyles.length - 1
            ? text.slice(start, end).replace(/\s*$/, "")
            : text.slice(start, end)
        this.applyTextStyle(style)
        ctx.fillText(body, x, y)
        return x + ctx.measureText(text)
      }, 0)

      return y + lineHeight(line)
    }, 0)
  }

  measureText(text, style) {
    this.applyTextStyle(style)
    return this.ctx.measureText(text)
  }
}

export class SvgBackend implements Backend {
  ctx: any = null
  $: any
  $textContainer: any

  constructor({ layout: { width, height } }) {
    this.$ = cheerio.load(
      `<?xml version="1.0" encoding="UTF-8" ?>
      <svg
        width="${width}"
        height="${height}"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
      >
      </svg>`,
      { xmlMode: true }
    )
  }

  toString() {
    return this.$.xml()
  }

  beginShape() {
    this.ctx = path()
    return this.ctx
  }

  commitShape({ fill = "none", stroke = "none", lineWidth = 0 }) {
    if (fill !== "none" || !(stroke === "none" || lineWidth === 0)) {
      this.$("svg").append(
        `<path
          d=${this.ctx.toString()}
          fill="${fill}"
          stroke="${stroke}"
          stroke-width="${lineWidth}"
        />`
      )
    }
    this.ctx = null
  }

  fillLines(lines, x, y) {
    const { textAlign = "left" as string } = lines[0].attributedStyles[0].style
    const originX = width * textAligns[textAlign]

    const $text = this.$(`<text />`).attr(
      "text-anchor",
      textAnchors[textAlign as string]
    )

    const { textLines } = lines.reduce((y, line) => {
      const { text, attributedStyles } = line
      const originY =
        y +
        lineBaseline(fontState, line) +
        (lineHeight(line) - lineFontSize(line)) / 2

      const tspans = attributedStyles.forEach(({ start, end, style }, i) => {
        $text
          .append(`<tspan/>`)
          .attr("x", i === 0 ? left + originX : null)
          .attr("y", i === 0 ? originY : null)
          .attr("fill", style.color)
          .text(
            i === attributedStyles.length - 1
              ? text.slice(start, end).replace(/\s*$/, "")
              : text.slice(start, end)
          )
      })

      return y + lineHeight(line)
    }, top)

    this.$("svg").append($text)
  }

  measureText(text, style) {
    const font = fontForStyle(style)
    return font.layout(text).advanceWidth / font.unitsPerEm * style.fontSize
  }
}
