import { ViewStyle } from "react-native"
import * as yoga from "yoga-layout-prebuilt"
import * as path from "path"
import { styleFromComponent, textLines } from "../layout/component-to-node"
import textToSvg from "./text-to-svg"
import { FontCache } from "../layout/"

import { RenderedComponent, Settings } from "../layout/index"
import wsp from "./whitespace"
import renderRect from "./rect"

export const getOpacity = (node) => {
  const { opacity = 1 } = styleFromComponent(node)
  return opacity
}

const renderers: {
  [key: string]: (settings: Settings, node: RenderedComponent) => string[]
} = {
  RCTScrollView: (settings, node) => renderers.View(settings, node),
  Image: (settings, node) => {
    const style = styleFromComponent(node)
    if (
      node.props.source &&
      (node.props.source.testUri || node.props.source.uri)
    ) {
      const uri = node.props.source.testUri || node.props.source.uri
      const opacity = getOpacity(node)
      const fullUri = uri.startsWith("/")
        ? uri
        : uri.match(/^https?:/)
        ? uri
        : path.relative(settings.renderPath, path.join(settings.basePath, uri))
      return [
        svg("image", node.layout, {
          "xlink:href": fullUri,
          preserveAspectRatio:
            node.props.resizeMode === "cover" ? "xMidYMid slice" : "",
          opacity: opacity === 1 ? undefined : opacity,
        }),
      ]
    } else {
      return renderers.View(settings, node)
    }
  },
  Text: (settings, node) => [
    textToSvg(
      settings.fontCache,
      node.layout,
      styleFromComponent(node),
      node[textLines]
    ),
  ],
  View: (settings, node) => {
    const opacity = getOpacity(node)
    const attributes: any = {
      type: node.type,
      // fill: "transparent",
      // stroke: "none",
      opacity: opacity === 1 ? undefined : opacity,
      // "stroke-width": "0.5",
      // "stroke": "#ff00ff",
      // "stroke-opacity": "0.3",
    }
    const style = styleFromComponent(node)

    return [renderRect(node.layout, style, attributes)]
  },
}

const svgForNode = (settings: Settings, node) => {
  if (!renderers[node.type]) {
    console.log("unexpected node type", node.type)
    return renderers.View(settings, node)
  } else {
    return renderers[node.type](settings, node)
  }
}

const nodeToSVG = (
  indent: number,
  node: RenderedComponent,
  settings: Settings
) => {
  const nodes: string[] = svgForNode(settings, node)
  return nodes.map((text) => "\n" + wsp(indent) + text).join("")
}

// This might be a reduce function?
const attributes = (settings) => {
  let attributeString = ""
  for (const key in settings) {
    if (settings.hasOwnProperty(key)) {
      const element = settings[key]
      if (element != null) {
        attributeString += ` ${key}="${element}"`
      }
    }
  }
  return attributeString
}

const svg = (type, { left, top, width, height }, settings) =>
  `<${type}${attributes(
    settings
  )} x="${left}" y="${top}" width="${width}" height="${height}"/>`

export default nodeToSVG
