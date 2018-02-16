import * as cheerio from "cheerio"
import { path } from "d3-path"
import { fontForStyle } from "../fonts"
import { lineFontSize, lineHeight } from "../text-layout"
import { Backend } from "./types"

const textAligns = {
  left: 0,
  center: 0.5,
  right: 1
}

const textAnchors = {
  left: "start",
  center: "middle",
  right: "end"
}

export default class SvgBackend implements Backend {
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

  lineBaseline(line) {
    line.attributedStyles
      .map(({ style }) => {
        const font = fontForStyle(style)
        return font.ascent / font.unitsPerEm * style.fontSize
      })
      .reduce(Math.max, 0)
  }

  fillLines(lines, { top, left, width }) {
    const { textAlign = "left" as string } = lines[0].attributedStyles[0].style
    const originX = left + width * textAligns[textAlign]

    const $text = this.$(`<text />`).attr(
      "text-anchor",
      textAnchors[textAlign as string]
    )

    const { textLines } = lines.reduce((y, line) => {
      const { text, attributedStyles } = line
      const originY =
        y +
        this.lineBaseline(line) +
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
