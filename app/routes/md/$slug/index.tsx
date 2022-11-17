import type { LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'

export const loader: LoaderFunction = ({ params }) => {
  return redirect(`/md/${params.slug}/visualizacoes`)
}
