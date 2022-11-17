import { Text } from '@lemonenergy/lemonpie'
import React from 'react'

import type { MarkdownFile } from '~/types/Markdown'

export const MDSelectView: React.FC<{
  file: Partial<MarkdownFile>
}> = ({ file }) => {
  return (
    <div>
      <Text variant="title300">{file.title}</Text>

      <div dangerouslySetInnerHTML={{ __html: file?.html ?? '' }}></div>
    </div>
  )
}
