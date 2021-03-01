import { ViewStyle } from "react-native"
import * as yoga from "yoga-layout-prebuilt"

import { styleFromComponent } from "../layout/component-to-node"
import { RenderedComponent } from "../layout/index"
import wsp from "./whitespace"
import {
  dashStyles,
  filledPathForSide,
  getBorderColor,
  getBorderWidth,
  getScaledBorderRadius,
  pathForRect,
  scaleSides,
  sidesEqual,
  strokedPathForSide,
} from "./borders"
import { $ } from "./svg-util"

export const clipPath = (layout: yoga.Layout, style: any) => {
  const borderRadii = getScaledBorderRadius(style, layout.width, layout.height)
  return $("path", {
    d: pathForRect(layout, borderRadii, [0, 0, 0, 0]),
  })
}

export default (layout, style: any, attributes) => {
  const borderWidths = getBorderWidth(style)
  const borderColors = getBorderColor(style)
  const borderRadii = getScaledBorderRadius(style, layout.width, layout.height)

  const borderStyle: string = style.borderStyle || "solid"
  const fill = style.backgroundColor || "none"

  // It's a normal or rounded rectangle
  if (
    sidesEqual(borderWidths) &&
    sidesEqual(borderColors) &&
    sidesEqual(borderRadii) &&
    borderStyle === "solid"
  ) {
    const borderWidth = borderWidths[0]
    const borderRadius = borderRadii[0]
    // Offset size by half border radius, as RN draws border inside, whereas SVG draws on both sides
    return $("rect", {
      ...attributes,
      x: layout.left + borderWidth * 0.5,
      y: layout.top + borderWidth * 0.5,
      width: layout.width - borderWidth,
      height: layout.height - borderWidth,
      fill,
      stroke: borderWidth ? borderColors[0] : undefined,
      "stroke-width": borderWidth || undefined,
      rx: borderRadius ? borderRadius - borderWidth * 0.5 : undefined,
      ry: borderRadius ? borderRadius - borderWidth * 0.5 : undefined,
    })

    // the border is consistent, but the corners are not
  } else if (
    sidesEqual(borderWidths) &&
    sidesEqual(borderColors) &&
    borderStyle === "solid"
  ) {
    const borderWidth = borderWidths[0]
    return $("path", {
      ...attributes,
      fill,
      stroke: borderWidth ? borderColors[0] : undefined,
      "stroke-width": borderWidth || undefined,
      d: pathForRect(layout, borderRadii, scaleSides(borderWidths, 0.5)),
    })

    // The widths aren't consistent, but colors are
  } else if (sidesEqual(borderColors) && borderStyle === "solid") {
    const backgroundShape = $("path", {
      ...attributes,
      fill,
      d: pathForRect(layout, borderRadii, scaleSides(borderWidths, 0.5)),
    })
    const borderShape = $("path", {
      fill: borderColors[0],
      d:
        pathForRect(layout, borderRadii, [0, 0, 0, 0]) +
        pathForRect(layout, borderRadii, borderWidths, true),
    })
    return backgroundShape + borderShape

    // The border is consistent, but it's not solid
  } else if (sidesEqual(borderWidths) && sidesEqual(borderColors)) {
    const borderWidth = borderWidths[0]
    const backgroundShape = $("path", {
      ...attributes,
      fill,
      d: pathForRect(layout, borderRadii, [0, 0, 0, 0]),
    })
    const borderShape = $("path", {
      ...dashStyles[borderStyle](borderWidth),
      fill: "none",
      stroke: borderWidth ? borderColors[0] : undefined,
      "stroke-width": borderWidth || undefined,
      d: pathForRect(layout, borderRadii, scaleSides(borderWidths, 0.5)),
    })
    return backgroundShape + borderShape

    // Different colors, but solid
  } else if (borderStyle === "solid") {
    const backgroundShape = $("path", {
      ...attributes,
      fill,
      d: pathForRect(layout, borderRadii, scaleSides(borderWidths, 0.5)),
    })
    const borders = borderColors.map((borderColor, side) =>
      $("path", {
        fill: borderColor || "none",
        d: filledPathForSide(layout, borderRadii, borderWidths, side),
      })
    )
    return backgroundShape + borders.join("")

    // Different colors, not solid
  } else {
    const backgroundShape = $("path", {
      ...attributes,
      fill,
      d: pathForRect(layout, borderRadii, [0, 0, 0, 0]),
    })
    const borders = borderColors.map((borderColor, side) =>
      $("path", {
        ...dashStyles[borderStyle](borderWidths[side]),
        stroke: borderColor,
        "stroke-width": borderWidths[side],
        d: strokedPathForSide(layout, borderRadii, borderWidths, side),
      })
    )
    return backgroundShape + borders.join("")
  }
}
