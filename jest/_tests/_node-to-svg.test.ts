import * as yoga from "yoga-layout-prebuilt"

import nodeToSVG from "../svg/node-to-svg"
import { fontState } from "../font-loader"

const component = (name) => ({
  type: name,
  props: {},
  children: [],
  textContent: undefined,
  layout: {
    left: 0,
    right: 6,
    top: 0,
    bottom: 100,
    width: 600,
    height: 400,
  },
})

describe("nodeToSVG", () => {
  it("handles a simple square", () => {
    const rootNode = component("my component")

    const settings = {
      width: 1024,
      height: 768,
    }

    const results = nodeToSVG(fontState, 0, rootNode, settings)
    expect(results).toMatchSnapshot()
  })
})
