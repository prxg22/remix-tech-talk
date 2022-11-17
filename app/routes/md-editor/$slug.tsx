import { Text } from '@lemonenergy/lemonpie'
import type { LoaderFunction, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Outlet, useCatch, useLoaderData } from '@remix-run/react'
import type { CatchBoundaryComponent } from '@remix-run/react/dist/routeModules'

import { Link } from '../../components/Link'
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
  const data = caught.data && JSON.parse(caught.data)
  if (caught.status === 404 && data?.file)
    return (
      <section>
        <Text variant="title200">{data.file.title}</Text>
        <Text variant="body300">
          Nenhum arquivo encontrado em "/{data.file.slug}".{' '}
          <Link to={`/md/criar?title=${data.file.title}`}>
            Deseja criar um agora?
          </Link>
        </Text>
      </section>
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
