import { ViewStyle } from "react-native"
import * as yoga from "yoga-layout-prebuilt"
import { textLines } from "./component-to-node"

import * as renderer from "react-test-renderer"
import { RenderedComponent } from "./index"

const renderedComponentTree = (
  root: renderer.ReactTestRendererJSON,
  node: yoga.NodeInstance
) => recurseTree(root, node)

export default renderedComponentTree

export const recurseTree = (
  component: renderer.ReactTestRendererJSON,
  node: yoga.NodeInstance
) => {
  const newChildren = [] as RenderedComponent[]

  // Don't go into Text nodes
  if (component.children && component.type !== "Text") {
    for (let index = 0; index < component.children.length; index++) {
      const childComponent = component.children[index]
      const childNode = node.getChild(index)
      if (typeof childComponent === "string") {
        throw new Error("Unexpected string child in non-Text node")
      }
      const renderedChildComponent = recurseTree(childComponent, childNode)
      newChildren.push(renderedChildComponent)
    }
  }

  return {
    type: component.type,
    props: component.props,
    children: newChildren,
    [textLines]: component[textLines],
    layout: {
      left: node.getComputedLeft(),
      right: node.getComputedRight(),
      top: node.getComputedTop(),
      bottom: node.getComputedBottom(),
      width: node.getComputedWidth(),
      height: node.getComputedHeight(),
    },
  } as RenderedComponent
}
