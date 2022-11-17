import {
  Link as LemonpieLink,
  Button as LemonpieButton,
  OutlineButton as LemonpieOutlineButton,
} from '@lemonenergy/lemonpie'
import { Link as RemixLink, NavLink as RemixNavLink } from '@remix-run/react'
import type {
  RemixLinkProps,
  RemixNavLinkProps,
} from '@remix-run/react/dist/components'
import React from 'react'

export const Link: React.FC<
  RemixLinkProps & React.RefAttributes<HTMLAnchorElement>
> = (props) => {
  return <LemonpieLink forwardedAs={RemixLink} {...props} onClick={() => {}} />
}

export const NavLink: React.FC<
  RemixNavLinkProps & React.RefAttributes<HTMLAnchorElement>
> = (props) => {
  return (
    <LemonpieLink forwardedAs={RemixNavLink} {...props} onClick={() => {}} />
  )
}

export const Button: React.FC<
  Partial<RemixLinkProps> & React.RefAttributes<HTMLAnchorElement>
> = (props) => {
  return (
    <LemonpieButton
      inline
      forwardedAs={props.to ? RemixLink : undefined}
      {...props}
    />
  )
}

export const OutlineButton: React.FC<
  Partial<RemixNavLinkProps> & React.RefAttributes<HTMLAnchorElement>
> = (props) => {
  return (
    <LemonpieOutlineButton
      inline
      forwardedAs={props.to ? RemixLink : undefined}
      {...props}
    />
  )
}
