import { useLocation } from '@remix-run/react'
import styled, { css } from 'styled-components'

import { Link } from './Link'

const BreadcrumbsContainer = styled.div(
  ({ theme: { spacing } }) => css`
    margin-bottom: ${spacing.sm};
    display: flex;
    align-items: center;
    gap: ${spacing.xs};

    a {
      text-decoration: none;
    }
  `,
)

export const Breadcrumbs = () => {
  const location = useLocation()

  return (
    <BreadcrumbsContainer>
      <Link to={'/'}>Home</Link>
      {location.pathname.split('/').map(
        (to, index, arr) =>
          to &&
          index && (
            <span key={to + index}>
              {'> '}
              <Link to={arr.slice(0, index + 1).join('/')}>{to || 'Home'}</Link>
            </span>
          ),
      )}
    </BreadcrumbsContainer>
  )
}

export default Breadcrumbs
