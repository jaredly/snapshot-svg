import React from "react"
import { create } from "react-test-renderer"

class View extends React.Component {
  render() {
    return React.createElement("View", this.props, this.props.children)
  }
}

class SetsSize extends React.Component {
  state = { width: 200 }

  setLayout = layout => {
    console.log("UPDATE LAYOUT", layout)
    this.setState({ width: 400 })
  }

  render() {
    const { width } = this.state
    return <View onLayout={this.setLayout} style={{ width }} />
  }
}

const instance = create(
  <View>
    <View>Hello</View>
    <SetsSize />
  </View>
)

const layoutChanged = (a, b) => a == null || b == null || a.width !== b.width

const viewsWithLayout = [View]

const forEachChild = (cb, value) => {
  if (Array.isArray(value)) {
    value.forEach(cb)
  } else if (value != null) {
    cb(value)
  }
}

const prepareLayout = (element, layouts = new WeakMap(), instance) => {
  if (instance != null && element.nodeType === "host") {
    const layout = { width: (element.props.style || {}).width }
    layouts.set(instance, layout)
  }

  forEachChild(
    child => prepareLayout(child, layouts, element.instance),
    element.rendered
  )

  return layouts
}

const applyLayout = (
  element,
  previousLayouts,
  nextLayouts,
  updateRecords = new Set()
) => {
  if (viewsWithLayout.includes(element.type)) {
    const previousLayout = previousLayouts.get(element.instance)
    const nextLayout = nextLayouts.get(element.instance)
    if (
      element.props.onLayout != null &&
      layoutChanged(previousLayout, nextLayout)
    ) {
      updateRecords.add(element)
    }
  }

  forEachChild(
    child => applyLayout(child, previousLayouts, nextLayouts, updateRecords),
    element.rendered
  )

  return updateRecords
}

const computeLayout = (element, previousLayouts = new WeakMap()) => {
  const nextLayouts = prepareLayout(element)
  const updateRecords = applyLayout(element, previousLayouts, nextLayouts)
  return { layouts: nextLayouts, updateRecords }
}

const childrenToJson = (children, layouts, layout) =>
  children != null
    ? [].concat(children).reduce((accum, child) => {
        let resolvedChild
        if (child == null || child === false) {
          return accum
        } else if (typeof child !== "object") {
          resolvedChild = child
        } else {
          resolvedChild = treeToJson(child, layouts, layout)
        }
        return accum.concat(resolvedChild)
      }, [])
    : null

const removeChildren = ({ children, ...props }) => props

const treeToJson = (node, layouts, layout) => {
  switch (node.nodeType) {
    case "component":
      return childrenToJson(node.rendered, layouts, layouts.get(node.instance))
    case "host":
      return {
        type: node.type,
        props: removeChildren(node.props),
        children: childrenToJson(node.rendered, layouts),
        layout
      }
    default:
      throw new Error("Unknown node")
  }
}

const computeTree = instance => {
  let updateRecords, layouts
  do {
    ;({ layouts, updateRecords } = computeLayout(instance.toTree(), layouts))
    updateRecords.forEach(element => {
      element.props.onLayout({ layout: layouts.get(element.instance) })
    })
  } while (updateRecords.size > 0)

  console.log(instance.toTree())
  console.log(instance.toJSON())
  return treeToJson(instance.toTree(), layouts)[0]
}

console.log(computeTree(instance))
