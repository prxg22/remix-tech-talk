import type { RenderableTreeNode } from '@markdoc/markdoc'
import Markdoc from '@markdoc/markdoc'
import React from 'react'

const config: Parameters<typeof Markdoc['transform']>[1] = {
  // nodes: {
  //   heading: {
  //     render: 'Heading',
  //     attributes: {
  //       id: { type: String },
  //       level: { type: Number },
  //     },
  //   },
  // },
}

const parseMDCode = (code: string) => {
  const ast = Markdoc.parse(code)
  const errors = Markdoc.validate(ast) || []

  return { ast, errors }
}

const getMDContent = (code: string) => {
  const { ast, errors } = parseMDCode(code)
  return { content: Markdoc.transform(ast, config), errors }
}

const renderHTML = (content: RenderableTreeNode) => {
  return Markdoc.renderers.html(content)
}

const renderReact = (content: RenderableTreeNode) => {
  return Markdoc.renderers.react(content, React, { components: {} })
}

const renderReactStatic = (content: RenderableTreeNode) => {
  return Markdoc.renderers.reactStatic(content)
}

export default {
  getMDContent,
  parseMDCode,
  renderHTML,
  renderReact,
  renderReactStatic,
}
