import * as cheerio from "cheerio"
import { path } from "d3-path"

export interface Backend {
  beginShape: () => void
  commitShape: (
    params: { fill?: string; stroke?: string; lineWidth?: number }
  ) => void
  // TODO: Begin transform groups
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
}

export class SvgBackend implements Backend {
  ctx: any = null
  $: any

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

  commitShape({
    fill = "none",
    stroke = "none",
    lineWidth = 0
  }: {
    fill?: string
    stroke?: string
    lineWidth?: number
  }) {
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
}
