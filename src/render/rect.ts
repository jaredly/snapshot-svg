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
  sidesEqual
} from "./borders"

export default (backend: Backend, layout, style: any) => {
  const borderWidths = getBorderWidth(style)
  const borderColors = getBorderColor(style)
  const borderRadii = getScaledBorderRadius(style, layout.width, layout.height)

  const borderStyle: string = style.borderStyle || "solid"

  const borderInsets =
    borderStyle === "solid" ? scaleSides(borderWidths, 0.5) : [0, 0, 0, 0]
  const backgroundCtx = backend.beginShape()
  drawRect(backgroundCtx, layout, borderRadii, borderInsets)
  backend.commitShape({ fill: style.backgroundColor || "none" })

  if (sidesEqual(borderWidths) && sidesEqual(borderColors)) {
    // The border is consistent in width and colour. It doesn't matter if it's solid
    // Draw a border with a line
    const [borderWidth = 0] = borderWidths
    const borderCtx = backend.beginShape()
    drawRect(borderCtx, layout, borderRadii, scaleSides(borderWidths, 0.5))
    backend.commitShape({ stroke: borderColors[0], lineWidth: borderWidth })
  } else if (borderStyle === "solid") {
    // Solid border - use a filled shape
    borderColors.forEach((borderColor, side) => {
      const borderCtx = backend.beginShape()
      drawSideFill(borderCtx, layout, borderRadii, borderWidths, side)
      backend.commitShape({ fill: borderColor })
    })
  } else {
    // Non-solid border. Use multiple lines.
    // Will look bad when border width varies.
    borderColors.forEach((borderColor, side) => {
      const borderCtx = backend.beginShape()
      drawSideStroke(borderCtx, layout, borderRadii, borderWidths, side)
      backend.commitShape({
        stroke: borderColor,
        lineWidth: borderWidths[side]
      })
    })
  }
}
