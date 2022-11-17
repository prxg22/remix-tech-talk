import { Icon, List, ListButton, ListItem, Text } from '@lemonenergy/lemonpie'
import type { LoaderFunction, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'

import { Link } from '../components/Link'
import { getMDFilesList } from '../services/markdown.server.service'

interface File {
  title: string
  slug: string
}

export const meta: MetaFunction = () => {
  return {
    title: 'Markdown Editor - Tech Talk',
  }
}

export const loader: LoaderFunction = async () => {
  const files = await getMDFilesList()
  return json({
    files,
  })
}

export default () => {
  const data = useLoaderData<{ files: File[] }>()

  return (
    <>
      <div>
        <Text variant="title100">Leitor de markdown</Text>
      </div>
      <section>
        {data && (
          <List>
            {data.files.map((file) => (
              <ListItem
                title={file.title}
                suffix={
                  <>
                    <Link to={`/md/${file.slug}/visualizacoes`}>
                      <Icon name="eye-open" />
                    </Link>
                    <Link to={`/md/${file.slug}/editar`}>
                      <Icon name="pencil" />
                    </Link>
                  </>
                }
                key={file.slug}
              />
            ))}
            <ListButton
              forwardedAs={Link}
              to="/md/criar"
              icon="plus"
              title="Novo documento"
              reloadDocument
            />
          </List>
        )}
      </section>
      <Outlet />
    </>
  )
}
