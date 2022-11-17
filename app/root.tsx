import { DialogProvider, ThemeProvider } from '@lemonenergy/lemonpie'
import type { LinksFunction, MetaFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'

import { Breadcrumbs } from './components/Breadcrumbs'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Tech Talk - Remix',
  viewport: 'width=device-width,initial-scale=1',
})

export const links: LinksFunction = () => {
  return [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
      rel: 'stylesheet',
    },
  ]
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        {typeof window === 'undefined' && '__STYLES__'}
      </head>
      <body>
        <ThemeProvider>
          {/* @ts-expect-error */}
          <DialogProvider>
            <Breadcrumbs />
            <Outlet />
          </DialogProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
