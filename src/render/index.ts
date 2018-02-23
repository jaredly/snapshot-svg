import layoutRoot, { Component, Settings } from "../layout"
import { styleFromComponent, textLines } from "../layout/component-to-node"
import renderRect from "./rect"

const renderers = {
  View(backend, node, settings) {
    const style = styleFromComponent(node)
    renderRect(backend, node.layout, style)
  },
  Text(backend, node) {
    backend.fillLines(node[textLines], node.layout)
  }
}

const renderNode = (backend, node, settings) =>
  renderers[node.type](backend, node, settings)

const recurseTree = async (backend, root, settings: Settings) => {
  await enderNode(backend, root, settings)

  if (!root.children) {
    return
  }

  for (const child of root.children) {
    await recurseTree(backend, child, settings)
  }
}

export default recurseTree
