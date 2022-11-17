import Stream from 'node:stream'

import type { EntryContext } from '@remix-run/node'
import { Response } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import isbot from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'

const ABORT_DELAY = 5000

const createStyledComponentsStream = (sheet: ServerStyleSheet) => {
  // let buff = Buffer.from('')
  // let lastIndex = 0

  // function read(this: Stream.Duplex, size: number) {
  //   const chunk = buff.subarray(lastIndex, size)
  //   lastIndex = lastIndex + size

  //   this.push(chunk)
  // }

  // function write(
  //   this: Stream.Duplex,
  //   chunk: Buffer,
  //   _: BufferEncoding,
  //   next: (error?: Error) => void,
  // ) {
  //   buff = Buffer.from(
  //     buff.toString() +
  //       chunk.toString().replace('__STYLES__', sheet.getStyleTags()),
  //   )

  //   next()
  // }

  function transform(
    this: Stream.Duplex,
    chunk: Buffer,
    enconding: BufferEncoding,
    next: (error?: Error, data?: Buffer) => void,
  ) {
    // console.log(chunk.toString().replace('__STYLES__', sheet.getStyleTags()))

    next(
      undefined,
      Buffer.from(chunk.toString().replace('__STYLES__', sheet.getStyleTags())),
    )
  }
  return new Stream.Transform({
    transform,
  })
  // return new Stream.Duplex({
  //   read,
  //   write,
  // })
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return isbot(request.headers.get('user-agent'))
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
      )
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let didError = false

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onAllReady() {
          const body = new Stream.PassThrough()

          responseHeaders.set('Content-Type', 'text/html')

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            }),
          )

          pipe(body)
        },
        onShellError(error: unknown) {
          reject(error)
        },
        onError(error: unknown) {
          didError = true

          console.error(error)
        },
      },
    )

    setTimeout(abort, ABORT_DELAY)
  })
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let didError = false

    const sheet = new ServerStyleSheet()
    const { pipe, abort } = renderToPipeableStream(
      sheet.collectStyles(
        <RemixServer context={remixContext} url={request.url} />,
      ),
      {
        onShellReady() {
          // const body = new Stream.PassThrough()
          const body = createStyledComponentsStream(sheet)

          responseHeaders.set('Content-Type', 'text/html')

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            }),
          )

          pipe(body)
        },
        onShellError(err: unknown) {
          console.log(err)
          reject(err)
        },
        onError(error: unknown) {
          didError = true

          console.error(error)
        },
        onAllReady() {},
      },
    )

    setTimeout(abort, ABORT_DELAY)
  })
}
