import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import React, { useState } from 'react'

import type { ViewerMode } from './__components/View'
import { viewerModes, MDSelectView } from './__components/View'

import { Button, OutlineButton } from '~/components/Link'
import { getMDFile, getTitleBySlug } from '~/services/markdown.server.service'

export const loader: LoaderFunction = async ({ params }) => {
  const { slug = '' } = params

  try {
    const file = await getMDFile(slug)
    return json({ file })
  } catch (e) {
    let err = e as any

    if (err.code === 'ENOENT' && err.syscall === 'open') {
      err.statusCode = 404
    }

    if (slug) {
      const file = {
        slug,
        title: getTitleBySlug(slug),
      }

      err.file = file
    }

    throw new Response(JSON.stringify(err), {
      statusText: err.message,
      status: err.statusCode ?? 400,
    })
  }
}

export default () => {
  const [view, setView] = useState<ViewerMode>('md')

  const data = useLoaderData()

  return (
    <>
      <div>
        {viewerModes.map((mode) => {
          const Component = mode === view ? Button : OutlineButton
          return (
            <Component
              onClick={() => {
                setView(mode)
              }}
              key={mode}
            >
              {mode}
            </Component>
          )
        })}
      </div>
      <MDSelectView mode={view} file={data.file} />
    </>
  )
}
