import path from 'path'

import type {
  Markdown,
  MarkdownFile,
  MarkdownFileAttributes,
} from '../types/Markdown'
import base64 from '../utils/base64.server'

import fs from '~/utils/file-system.server'
import Markdoc from '~/utils/markdown'

const markdownPath = path.join(process.cwd(), '/markdown')

export const getMDFilesList = async (): Promise<MarkdownFileAttributes[]> => {
  const dir = await fs.getOrCreateDirectory(markdownPath)

  return dir
    .filter((f) => /\.md$/.test(f))
    .map((file) => ({
      title: getTitleByFilename(file),
      slug: getSlugByFilename(file),
    }))
}

const getMDCodeFromFile = async (slug: string): Promise<string> => {
  const mdPath = getMDFilePathBySlug(slug)

  const code = await fs.readFile(mdPath)
  return code
}

export const parseMDCode = (code: string): Markdown => {
  const { content, errors } = Markdoc.getMDContent(code)

  return {
    code,
    errors,
    html: Markdoc.renderHTML(content),
  }
}

export const getMDFile = async (slug: string): Promise<MarkdownFile> => {
  const code = await getMDCodeFromFile(slug)

  return {
    ...parseMDCode(code),
    title: getTitleBySlug(slug),
    slug,
  }
}

export const saveMDFile = async (slug: string, code: string) => {
  await fs.writeFile(getMDFilePathBySlug(slug), code)
}

export const encodeMDToBase64 = (attrs: Markdown) => {
  return base64.encode(JSON.stringify(attrs))
}

export const decodeMDFromBase64 = (str?: string): MarkdownFile => {
  return str ? JSON.parse(base64.decode(str)) : undefined
}

export const getMDFilePathBySlug = (slug: string) => {
  return path.join(markdownPath, `${base64.encode(slug)}.md`)
}

export const getTitleBySlug = (slug: string) => {
  return slug.replace(/-/g, ' ')
}
const getSlugByFilename = (file: string) => {
  return base64.decode(file.replace('.md', '')).replace(/\s/g, '-')
}

export const getSlugByTitle = (title: string) => {
  return title.toLowerCase().trim().replace(/\s/g, '-')
}
export const getTitleByFilename = (filename: string) => {
  return getTitleBySlug(getSlugByFilename(filename))
}
