import * as yoga from "yoga-layout-prebuilt"

import treeToSVG from "../svg/tree-to-svg"
import { fontState } from "../font-loader"

describe("treeToSVG", () => {
  it("wraps whatever text you pass into it with an SVG schema", () => {
    const renderedComponent = {
      type: "my component",
      props: {},
      children: [],
      textContent: undefined,
      layout: {
        left: 2,
        right: 6,
        top: 80,
        bottom: 100,
        width: 200,
        height: 200,
      },
    }

    const settings = {
      width: 1024,
      height: 768,
    }

    const results = treeToSVG(fontState, renderedComponent, settings)
    expect(results).toMatchSnapshot()
  })
})
