import styled, { css } from 'styled-components'

export const Editor = styled.section(
  ({ theme: { spacing } }) => css`
    display: flex;
    gap: ${spacing.lg};

    #editor {
      min-width: 50%;

      form > textarea {
        width: 100%;
        min-height: 500px;
        resize: none;
      }
    }
  `,
)
