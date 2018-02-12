import { ViewStyle } from "react-native"
import * as yoga from "yoga-layout"

import { styleFromComponent } from "../layout/component-to-node"
import { RenderedComponent } from "../layout/index"
import { Backend } from "./backends"
import {
  dashStyles,
  drawRect,
  drawSideFill,
  drawSideStroke,
  getBorderColor,
  getBorderWidth,
  getScaledBorderRadius,
  scaleSides,
  sidesEqual,
} from "./borders"

export default (backend: Backend, layout, style: any, attributes) => {
  const borderWidths = getBorderWidth(style)
  const borderColors = getBorderColor(style)
  const borderRadii = getScaledBorderRadius(style, layout.width, layout.height)

  const borderStyle: string = style.borderStyle || "solid"
  const fill = style.backgroundColor || "none"

  const backgroundCtx = backend.beginShape()
  const borderInsets = borderStyle === "solid" ? scaleSides(borderWidths, 0.5) : [0, 0, 0, 0]
  drawRect(backgroundCtx, layout, borderRadii, borderInsets)

  // Solid borders with consistent colors
  if (sidesEqual(borderColors) && borderStyle === "solid") {
    const borderCtx = backend.beginShape()
    drawRect(borderCtx, layout, borderRadii, [0, 0, 0, 0])
    backend.commitShape({ fill: borderColors[0] })

  // The border is consistent, but it's not solid
  } else if (sidesEqual(borderWidths) && sidesEqual(borderColors)) {
    const [borderWidth = 0] = borderWidths
    const borderCtx = backend.beginShape()
    drawRect(borderCtx, layout, borderRadii, scaleSides(borderWidths, 0.5))
    backend.commitShape({ stroke: borderColors[0], lineWidth: borderWidth })

  // Different colors, but solid
  } else if (borderStyle === "solid") {
    borderColors.forEach((borderColor, side) => {
      const borderCtx = backend.beginShape()
      drawSideFill(borderCtx, layout, borderRadii, borderWidths, side)
      backend.commitShape({ fill: borderColor })
    })

  // Different colors, not solid
  } else {
    borderColors.forEach((borderColor, side) => {
      const borderCtx = backend.beginShape()
      drawSideStroke(borderCtx, layout, borderRadii, borderWidths, side)
      backend.commitShape({ stroke: borderColor, lineWidth: borderWidths[side] })
    })
  }
}
