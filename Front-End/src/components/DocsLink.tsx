import React, { FC } from 'react'
import { CLink } from '@coreui/react'

interface DocsLinkProps {
  href?: string;
  name?: string;
  text?: string;
  [key: string]: any; // for ...rest props
}

const DocsLink: FC<DocsLinkProps> = ({ href, name, text, ...rest }) => {
  const _href = name ? `https://coreui.io/react/docs/components/${name}` : href

  return (
    <div className="float-end">
      <CLink
        {...rest}
        href={_href}
        rel="noreferrer noopener"
        target="_blank"
        className="card-header-action"
      >
        <small className="text-medium-emphasis">{text || 'docs'}</small>
      </CLink>
    </div>
  )
}

export default React.memo(DocsLink);
