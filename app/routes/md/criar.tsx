import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Icon,
  OutlineButton,
  Text,
  TextInput,
} from '@lemonenergy/lemonpie'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { redirect, json } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useLocation,
  useSubmit,
} from '@remix-run/react'
import type { FormEventHandler } from 'react'

import { Editor } from '../../components/Editor'
import { Link } from '../../components/Link'
import {
  decodeMDFromBase64,
  encodeMDToBase64,
  getSlugByTitle,
  parseMDCode,
  saveMDFile,
} from '../../services/markdown.server.service'
import type { MarkdownFile } from '../../types/Markdown'

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)

  const encoded = url.searchParams.get('c') || ''
  const file = encoded && decodeMDFromBase64(encoded)
  const title = url.searchParams.get('title')
  return json({
    file: { ...file, title },
    shouldEnableCreateButton: Boolean(file && title),
  })
}

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData()
  const url = new URL(request.url)

  const code = formData.get('code')?.toString() || ''
  const title = url.searchParams.get('title')
  const slug = title ? getSlugByTitle(title) : ''

  const currentCode =
    url.searchParams.get('c') &&
    decodeMDFromBase64(url.searchParams.get('c') || '')

  const action = formData.get('action')
  switch (action) {
    case 'preview':
      let parsed = parseMDCode(code)
      if (parsed.errors && parsed.errors.length) {
        parsed = {
          ...decodeMDFromBase64(currentCode),
          errors: parsed.errors,
        }
      }
      url.searchParams.set('c', encodeMDToBase64(parsed))
      return redirect(url.toString())
    case 'create':
      if (!title)
        return json({
          error: 'Um título precisa ser escolhido antes de salvar',
        })
      await saveMDFile(slug, code)
      return redirect(`/md/${slug}/editar`)
    default:
      return null
  }
}

export default () => {
  const location = useLocation()
  const loaderData = useLoaderData<{
    file?: Partial<MarkdownFile>
    shouldEnableCreateButton: boolean
  }>()
  const actionData = useActionData()
  const submit = useSubmit()

  const handleTextAreaChange: FormEventHandler<HTMLTextAreaElement> = (ev) => {
    const formData = new FormData()

    if (ev.target !== ev.currentTarget) return

    formData.set('code', ev.currentTarget.value || '')
    formData.set('action', 'preview')

    submit(formData, { method: 'post' })
  }

  const handleTitleInputChange: FormEventHandler<HTMLInputElement> = (ev) => {
    const formData = new FormData()

    if (ev.target !== ev.currentTarget) return

    formData.set('title', ev.currentTarget.value || '')
    formData.set('code', loaderData.file?.code || '')

    submit(formData, { method: 'get' })
  }

  return (
    <Editor>
      {/* {actionData?.error && (
        <noscript>
          <div>
            <Link to="#">
              <Icon name="cross" />
            </Link>
            <Text>
              <Text as="span" bold>
                ERRO:
              </Text>{' '}
              {actionData?.error}
            </Text>
          </div>
        </noscript>
      )} */}
      <Dialog
        isOpen={Boolean(actionData?.error)}
        onClose={() => submit(new FormData())}
      >
        <DialogHeader>Erro!</DialogHeader>
        <DialogBody>
          <Text>
            <Text as="span" bold>
              ERRO:
            </Text>{' '}
            {actionData?.error}!
          </Text>
        </DialogBody>
        <DialogFooter>
          <OutlineButton to={location.pathname} inline>
            Voltar
          </OutlineButton>
        </DialogFooter>
      </Dialog>
      <div id="editor">
        <Form method="get">
          <TextInput
            onChange={handleTitleInputChange}
            label="Título"
            name="title"
            defaultValue={loaderData.file?.title}
          />
          <noscript>
            {/* @ts-ignore */}
            <Button inline>Salvar título</Button>
          </noscript>
        </Form>
        <Form method="post">
          <textarea
            name="code"
            defaultValue={loaderData.file?.code}
            onChange={handleTextAreaChange}
          ></textarea>
          <noscript>
            {/* @ts-ignore */}
            <Button inline name="action" value="preview">
              Preview
            </Button>
          </noscript>
        </Form>

        <Form method="post">
          <input type="hidden" name="title" value={loaderData.file?.title} />
          <input type="hidden" name="code" value={loaderData.file?.code} />
          {/* @ts-expect-error */}
          <OutlineButton
            disabled={!loaderData.shouldEnableCreateButton}
            name="action"
            value="create"
            inline
          >
            Criar
          </OutlineButton>
        </Form>
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: loaderData.file?.html || '' }}
      ></div>
    </Editor>
  )
}
