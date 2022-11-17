import type { ValidateError } from '@markdoc/markdoc'

export interface Markdown {
  code: string
  html: string
  errors?: ValidateError[]
}

export interface MarkdownFileAttributes {
  title: string
  slug: string
}

export interface MarkdownFile extends Markdown, MarkdownFileAttributes {}
