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

export const renderToSvg = async (
  root,
  settings: Settings = defaultSettings
) => {
  const formattedRoot = layoutRoot(root, settings)
  const backend = new SvgBackend(formattedRoot)
  await render(backend, formattedRoot, settings)
  return String(backend)
}

export const renderToCanvas = async (
  ctx,
  root,
  settings: Settings = defaultSettings
) => {
  const formattedRoot = layoutRoot(root, settings)
  const backend = new CanvasBackend(ctx)
  await render(backend, formattedRoot, settings)
}
