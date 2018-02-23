import { CanvasBackend, SvgBackend } from "./backends"
import layoutRoot, { Component, Settings } from "./layout"
import render from "./render"

const defaultSettings: Settings = {
  width: 500,
  height: 500,
  fontCache: { fonts: {}, fallbacks: {} },
  basePath: "./",
  renderPath: "./",
  assetMap: {}
}

const renderBackend = async (
  backend,
  root,
  settings: Settings = defaultSettings
) => {
  const formattedRoot = layoutRoot(backend, root, settings)
  backend.setDimensions(formattedRoot.layout)
  await render(backend, formattedRoot, settings)
  return backend
}

export const renderToSvg = async (root, settings) =>
  String(renderBackend(new SvgBackend(), root, settings))

export const renderToCanvas = async (ctx, root, settings) => {
  renderBackend(new CanvasBackend(ctx), root, settings)
  return ctx
}
