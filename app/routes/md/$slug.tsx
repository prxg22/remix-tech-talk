import { Text } from '@lemonenergy/lemonpie'
import type { LoaderFunction, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Outlet, useCatch, useLoaderData } from '@remix-run/react'
import type { CatchBoundaryComponent } from '@remix-run/react/dist/routeModules'

import type { MarkdownFileAttributes } from '../../types/Markdown'

import { getTitleBySlug } from '~/services/markdown.server.service'

export const meta: MetaFunction = ({ data }) => {
  return { title: `Markdown Editor${data ? ` - ${data?.file?.title}` : ''}` }
}

export const loader: LoaderFunction = async ({ params }) => {
  const { slug = '' } = params

  const file: MarkdownFileAttributes = {
    slug,
    title: getTitleBySlug(slug),
  }

  return json({ file })
}

export const CatchBoundary: CatchBoundaryComponent = () => {
  const caught = useCatch()

  if (caught.status === 404)
    return (
      <>
        <section>
          <Text variant="title200">{caught.data?.file?.title}</Text>
          <Text variant="body300">
            Nenhum arquivo encontrado em "{caught.data?.file?.path}"
          </Text>
        </section>
      </>
    )

  throw caught
}

export default () => {
  const data = useLoaderData<{
    file: MarkdownFileAttributes
  }>()

  return (
    <>
      <hr />
      <section>
        <Text variant="title200">{data.file.title}</Text>
        <Text variant="body300">{data.file.slug}</Text>
      </section>
      <Outlet />
    </>
  )
}
