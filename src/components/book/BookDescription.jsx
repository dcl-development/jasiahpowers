import { PortableText } from '@portabletext/react'

const components = {
  marks: {
    link: ({ value, children }) => {
      const href = value?.href || ''
      const external = /^https?:/i.test(href)
      return (
        <a
          className="motion-link"
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      )
    },
  },
}

export default function BookDescription({ value }) {
  if (!value?.length) return null
  return (
    <div className="prose book-description">
      <PortableText value={value} components={components} />
    </div>
  )
}
