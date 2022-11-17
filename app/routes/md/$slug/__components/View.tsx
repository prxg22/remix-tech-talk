import { Text } from '@lemonenergy/lemonpie'
import React from 'react'

import type { MarkdownFile } from '~/types/Markdown'

export const viewerModes = [
  'md',
  'html',
  'iframe',
  'dangerouslySetInnerHTML',
] as const

export type ViewerMode = typeof viewerModes[number]
export type ViewFactories = Record<
  ViewerMode,
  (file?: MarkdownFile) => React.ReactNode
>

export const viewerFactories: ViewFactories = {
  md: (file) => (
    <div>
      <Text variant="title300">HTML code:</Text>
      <pre>{file?.code}</pre>
    </div>
  ),
  html: (file) => (
    <div>
      <Text variant="title300">HTML code:</Text>
      <pre>{file?.html}</pre>
    </div>
  ),
  iframe: (file) => (
    <div>
      <Text variant="title300">iframe w/ HTML code:</Text>
      <iframe
        title={file?.title + '-html'}
        src={`data:text/html;charset=utf-8,${file?.html}`}
      />
    </div>
  ),
  dangerouslySetInnerHTML: (file) => (
    <div>
      <Text variant="title300">
        <code>dangerouslySetInnerHTML</code>:
      </Text>

      <div dangerouslySetInnerHTML={{ __html: file?.html ?? '' }}></div>
    </div>
  ),
}

export const MDSelectView: React.FC<{
  file: MarkdownFile
  mode?: ViewerMode
}> = ({ file, mode = 'md' }) => {
  const createViewer = viewerFactories[mode] ?? viewerFactories['md']
  const viewer = createViewer(file)
  return <>{viewer}</>
}
