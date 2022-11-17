import { Button, OutlineButton } from '@lemonenergy/lemonpie'
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node'
import { redirect, json } from '@remix-run/node'
import { Form, useLoaderData, useSubmit } from '@remix-run/react'
import type { FormEventHandler } from 'react'

import { Editor } from '../../../components/Editor'
import {
  decodeMDFromBase64,
  encodeMDToBase64,
  getMDFile,
  getTitleBySlug,
  parseMDCode,
  saveMDFile,
} from '../../../services/markdown.server.service'
import type { MarkdownFile } from '../../../types/Markdown'
import { createMDErrorResponse } from '../../../utils/errors.server'

import { MDSelectView } from './__components/View'

export const meta: MetaFunction = ({ data }) => {
  return { title: `Markdown Editor${data ? ` - ${data?.file?.title}` : ''}` }
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url)
  const { slug = '' } = params

  try {
    const encoded = url.searchParams.get('c') || undefined
    const decoded = encoded && decodeMDFromBase64(encoded)
    let file = await getMDFile(slug ?? '')
    const shouldSave = decoded && decoded.code !== file.code

    return json({
      file: shouldSave ? decodeMDFromBase64(encoded) : file,
      shouldSave,
    })
  } catch (e) {
    throw createMDErrorResponse(e, slug, getTitleBySlug(slug))
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  const { slug = '' } = params
  const formData = await request.formData()
  const url = new URL(request.url)

  const code = formData.get('code')?.toString() || ''
  const encoded = url.searchParams.get('c') || ''
  const current = decodeMDFromBase64(encoded)

  const action = formData.get('action')
  switch (action) {
    case 'preview':
      const parsed = parseMDCode(code)
      const next = parsed.errors && parsed.errors.length ? current : parsed
      url.searchParams.set('c', encodeMDToBase64(next))
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

    submit(formData, { method: 'post', replace: true })
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
      {data.file && <MDSelectView file={data.file} />}
    </Editor>
  )
}
