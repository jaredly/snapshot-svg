import * as yoga from "yoga-layout-prebuilt"
import { RenderedComponent, Settings } from "../layout"
import nodeToSVG, { getOpacity } from "./node-to-svg"
import { styleFromComponent } from "../layout/component-to-node"
import wsp from "./whitespace"
import { FontCache } from "../layout"

export const recurseTree = (
  indent: number,
  root: RenderedComponent,
  settings: Settings
) => {
  const nodeString = nodeToSVG(indent, root, settings)

  const childrenCount = root.children.length
  if (!childrenCount) {
    return nodeString
  }

  return (
    nodeString +
    groupWrap(root, indent, () => {
      let childGroups = ""

      for (let index = 0; index < childrenCount; index++) {
        const child = root.children[index]
        // Don't go into Text nodes
        if (!(typeof child === "string")) {
          childGroups += recurseTree(indent + 1, child, settings)
        }
      }

      return childGroups
    })
  )
}

export const svgWrapper = (
  bodyText: string,
  root: RenderedComponent,
  settings: Settings
) =>
  `<?xml version="1.0" encoding="UTF-8" ?>
<svg width="${root.layout.width}" height="${
    root.layout.height
  }" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
${
  settings.backgroundColor
    ? `<rect width="${root.layout.width}" height="${root.layout.width}" fill="${settings.backgroundColor}" />`
    : ""
}
${bodyText}
</svg>
`

const opacityProp = (node) => {
  const opacity = getOpacity(node)
  if (opacity === 1) return ""
  return ` opacity='${opacity}'`
}

export const groupWrap = (
  node: RenderedComponent,
  indent: number,
  recurse: () => string
) => `

${wsp(indent)}<g transform='translate(${node.layout.left}, ${
  node.layout.top
})'${opacityProp(node)}>${recurse()}
${wsp(indent)}</g>
`

const treeToSVG = (root: RenderedComponent, settings: Settings) => {
  return svgWrapper(recurseTree(0, root, settings), root, settings)
}

export default treeToSVG
