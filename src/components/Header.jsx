'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useStoreLaunched } from '@/hooks/useStoreLaunched'

const NAV = [
  { href: '/projects', label: 'Projects' },
  { href: '/photos', label: 'Photos' },
  { href: '/shop', label: 'Shop' },
  { href: '/video', label: 'Video' },
  { href: '/contact', label: 'Contact' },
]

export default function Header({ title, musicLink, storeOpen = false }) {
  const pathname = usePathname()
  const launched = useStoreLaunched()
  const showShop = storeOpen || launched

  return (
    <header className="site-header">
      <a className="skip" href="#content">
        Skip to content
      </a>
      <div className="site-header__bar">
        <Link href="/" className="wordmark">
          <Image
            src="/logo-mark.png"
            alt=""
            width={72}
            height={88}
            className="wordmark__mark"
          />
          <span className="wordmark__text">{title}</span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <div className="site-nav__group">
            {NAV.filter((item) => item.href !== '/shop' || showShop).map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="motion-link"
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
            <a
              className="motion-link"
              href={musicLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Music
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
