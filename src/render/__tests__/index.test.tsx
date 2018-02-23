import * as Canvas from "canvas-prebuilt"
import * as fs from "fs"
import { toMatchImageSnapshot } from "jest-image-snapshot"
import * as React from "react"
import { Text, View } from "react-native"
import * as renderer from "react-test-renderer"
import { renderToCanvas, renderToSvg } from "../.."

expect.extend({ toMatchImageSnapshot })

test("render to svg", async () => {
  const jsx = (
    <View style={{ backgroundColor: "red", width: 100, height: 50 }} />
  )

  const component = renderer.create(jsx).toJSON()
  const svg = await renderToSvg(component)
  expect(svg).toMatchSnapshot()
})

test("render to canvas", async () => {
  const jsx = (
    <View style={{ backgroundColor: "red", width: 100, height: 50 }} />
  )

  const component = renderer.create(jsx).toJSON()
  const canvas = new Canvas(100, 50)
  const ctx = canvas.getContext("2d")
  await renderToCanvas(ctx, component)
  const image = canvas.toBuffer()
  expect(image).toMatchImageSnapshot()
})

test("render text to svg", async () => {
  const jsx = (
    <View style={{ backgroundColor: "red", width: 100, height: 50 }}>
      <Text>Hello World!</Text>
    </View>
  )

  const component = renderer.create(jsx).toJSON()
  const svg = await renderToSvg(component)
  expect(svg).toMatchSnapshot()
})

test("render text to canvas", async () => {
  const jsx = (
    <View style={{ backgroundColor: "red", width: 100, height: 50 }}>
      <Text>Hello World!</Text>
    </View>
  )

  const component = renderer.create(jsx).toJSON()
  const canvas = new Canvas(100, 50)
  const ctx = canvas.getContext("2d")
  await renderToCanvas(ctx, component)
  const image = canvas.toBuffer()
  expect(image).toMatchImageSnapshot()
})
