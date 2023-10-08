'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavBar() {
  const pages = {
    '/': 'Home',
    '/play': 'Play',
    '/signin': 'Sign in'
  }

  const pathname = usePathname()

  return (
    <header>
      <nav>
        <ul className="flex flex-row justify-start text-xl">
          {Object.entries(pages).map(([link, text]) => (
            <li key={link} className={`mx-5 my-2 ${pathname === link && 'text-orange-500'}`}>
              <Link href={link}>{text}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
