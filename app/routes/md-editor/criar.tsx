import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
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
  useSearchParams,
  useSubmit,
} from '@remix-run/react'
import type { FormEventHandler } from 'react'
import { useRef } from 'react'

import { Editor } from '../../components/Editor'
import {
  decodeMDFromBase64,
  encodeMDToBase64,
  getSlugByTitle,
  parseMDCode,
  saveMDFile,
} from '../../services/markdown.server.service'
import type { MarkdownFile } from '../../types/Markdown'

import { MDSelectView } from './$slug/__components/View'

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)

  const encoded = url.searchParams.get('c') || ''
  const file = encoded && decodeMDFromBase64(encoded)
  const title = url.searchParams.get('title')

  const shouldEnableCreateButton = Boolean(file && title)

  return json({
    file: { ...file, title },
    shouldEnableCreateButton,
  })
}

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData()
  const url = new URL(request.url)

  const code = formData.get('code')?.toString() || ''
  const encoded = url.searchParams.get('c') || ''
  const current = decodeMDFromBase64(encoded)
  const title = url.searchParams.get('title')
  const slug = title ? getSlugByTitle(title) : ''

  const action = formData.get('action')
  switch (action) {
    case 'preview':
      const parsed = parseMDCode(code)
      const next = parsed.errors && parsed.errors.length ? current : parsed
      url.searchParams.set('c', encodeMDToBase64(next))
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
  const [searchParams] = useSearchParams()
  const loaderData = useLoaderData<{
    file?: Partial<MarkdownFile>
    shouldEnableCreateButton: boolean
  }>()
  const actionData = useActionData()
  const submit = useSubmit()
  const titleRef = useRef<HTMLFormElement>(null)

  const handleTextAreaChange: FormEventHandler<HTMLTextAreaElement> = (ev) => {
    const formData = new FormData()

    if (ev.target !== ev.currentTarget) return

    formData.set('code', ev.currentTarget.value || '')
    formData.set('action', 'preview')

    submit(formData, { method: 'post', replace: true })
  }

  const handleTitleInputChange = () => {
    submit(titleRef.current)
  }

  return (
    <Editor>
      <Dialog
        isOpen={Boolean(actionData?.error)}
        onClose={handleTitleInputChange}
      >
        {/* @ts-ignore */}
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
          {/* @ts-ignore */}
          <OutlineButton onClick={handleTitleInputChange} inline>
            Voltar
          </OutlineButton>
        </DialogFooter>
      </Dialog>
      <div id="editor">
        <Form method="get" ref={titleRef}>
          <input name="c" type="hidden" value={searchParams.get('c') || ''} />
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

        {loaderData.shouldEnableCreateButton && (
          <Form method="post">
            <input type="hidden" name="title" value={loaderData.file?.title} />
            <input type="hidden" name="code" value={loaderData.file?.code} />
            {/* @ts-expect-error */}
            <OutlineButton name="action" value="create" inline>
              Criar
            </OutlineButton>
          </Form>
        )}
      </div>
      <div>
        <Text variant="title300">{loaderData?.file?.title}</Text>
        {loaderData.file && <MDSelectView file={loaderData.file} />}
      </div>
    </Editor>
  )
}
