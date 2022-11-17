import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { createMDErrorResponse } from '../../../utils/errors.server'

import { MDSelectView } from './__components/View'

import { getMDFile, getTitleBySlug } from '~/services/markdown.server.service'

export const loader: LoaderFunction = async ({ params }) => {
  const { slug = '' } = params

  try {
    const file = await getMDFile(slug)
    return json({ file })
  } catch (e) {
    throw createMDErrorResponse(e, slug, getTitleBySlug(slug))
  }
}

export default () => {
  const data = useLoaderData()

  return <MDSelectView file={data.file} />
}
