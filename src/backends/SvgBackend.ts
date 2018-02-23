import * as cheerio from "cheerio"
import { path } from "d3-path"
import * as format from "xml-formatter"
import { fontForStyle } from "../fonts"
import { Backend } from "./types"
import { enumerateLines } from "./util"

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

  constructor() {
    this.$ = cheerio.load(
      `<?xml version="1.0" encoding="UTF-8" ?>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
      ></svg>`,
      { xmlMode: true }
    )
  }

  toString() {
    return format(this.$.xml())
  }

  setDimensions({ width, height }) {
    this.$("svg")
      .attr("width", width)
      .attr("height", height)
  }

  beginShape() {
    this.ctx = path()
    return this.ctx
  }

  commitShape({ fill = "none", stroke = "none", lineWidth = 0 }) {
    if (fill !== "none" || !(stroke === "none" || lineWidth === 0)) {
      const $path = this.$(`<path />`)
        .attr("d", String(this.ctx))
        .attr("fill", fill)
        .attr("stroke", stroke)
        .attr("stroke-width", lineWidth)
      this.$("svg").append($path)
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

    const $text = this.$(`<text />`).attr("text-anchor", textAnchors[textAlign])

    enumerateLines(lines, ({ y, body, style, i }) => {
      $text
        .append(`<tspan/>`)
        .attr("x", i === 0 ? left + originX : null)
        .attr("y", i === 0 ? top + y : null)
        .attr("fill", style.color)
        .text(body)
    })

    this.$("svg").append($text)
  }

  measureText(text, style) {
    const font = fontForStyle(style)
    return font.layout(text).advanceWidth / font.unitsPerEm * style.fontSize
  }
}
