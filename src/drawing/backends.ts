import { path } from "d3-path"

export interface Backend {
  beginShape: () => void
  commitShape: (params: { fill?: string, stroke?: string, lineWidth?: number }) => void
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
  svg: string = "" // Probably use some XML library, because this will get out of hand

  beginShape() {
    this.ctx = path()
    return this.ctx
  }

  commitShape({ fill = "none", stroke = "none", lineWidth }: { fill?: string, stroke?: string, lineWidth?: number }) {
    this.svg +=
      `<path d=${this.ctx.toString()} fill="${fill}" stroke="${stroke}" stroke-line-width="${lineWidth}" />`
  }
}
