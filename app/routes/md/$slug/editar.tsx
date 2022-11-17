import { Button, OutlineButton } from '@lemonenergy/lemonpie'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { redirect, json } from '@remix-run/node'
import { Form, useLoaderData, useSubmit } from '@remix-run/react'
import type { FormEventHandler } from 'react'

import { Editor } from '../../../components/Editor'
import {
  decodeMDFromBase64,
  encodeMDToBase64,
  getMDFile,
  parseMDCode,
  saveMDFile,
} from '../../../services/markdown.server.service'
import type { MarkdownFile } from '../../../types/Markdown'

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url)
  const { slug } = params

  let file: MarkdownFile | undefined = undefined

  if (url.searchParams.get('c') !== null) {
    const encoded = url.searchParams.get('c') || ''
    file = decodeMDFromBase64(encoded)
    console.log({ encoded, file })
  }

  if (!file) file = await getMDFile(slug ?? '')

  return json({
    file,
    shouldSave: Boolean(url.searchParams.get('c')),
  })
}

export const action: ActionFunction = async ({ request, params }) => {
  const { slug = '' } = params
  const formData = await request.formData()
  const url = new URL(request.url)

  const code = formData.get('code')?.toString() || ''
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
    case 'save':
      await saveMDFile(slug, code)
      return redirect(url.pathname)
    default:
      return null
  }
}

export default () => {
  const data = useLoaderData<{ file: MarkdownFile; shouldSave: boolean }>()

  const submit = useSubmit()

  const handleTextAreaChange: FormEventHandler<HTMLTextAreaElement> = (ev) => {
    const formData = new FormData()

    if (ev.target !== ev.currentTarget) return

    formData.set('code', ev.currentTarget.value || '')
    formData.set('action', 'preview')

    submit(formData, { method: 'post' })
  }

  return (
    <Editor>
      <div id="editor">
        <Form method="post">
          <textarea
            name="code"
            defaultValue={data.file.code}
            onChange={handleTextAreaChange}
          ></textarea>
          <noscript>
            {
              // @ts-expect-error
              <Button inline name="action" value="preview">
                Preview
              </Button>
            }
          </noscript>
        </Form>

        <Form method="post">
          <input type="hidden" name="code" value={data.file.code} />
          {data?.shouldSave && (
            // @ts-expect-error
            <OutlineButton name="action" value="save" inline>
              Salvar
            </OutlineButton>
          )}
        </Form>
      </div>
      <div dangerouslySetInnerHTML={{ __html: data.file.html }}></div>
    </Editor>
  )
}
