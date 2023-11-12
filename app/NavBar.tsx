'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useContext} from "react";
import AuthContext from "@/context/AuthContext";

export default function NavBar() {
  const authContext = useContext(AuthContext)
  const pages = {
    '/': 'Home',
    '/play': 'Play',
    '/signin': (authContext.user || !authContext.authReady) ? null : 'Sign in',
    '/profile': (!authContext.user || !authContext.authReady) ? null : (authContext.user as {"login": string}).login,
  }

  const pathname = usePathname()

  return (
    <header>
      <nav>
        <ul className="flex flex-row justify-start text-xl">
          {Object.entries(pages).filter(([_, text]) => text !== null)
            .map(([link, text]) => (
              <li key={link} className={`mx-5 my-2 ${pathname === link && 'text-orange-500'}`}>
                <Link href={link}>{text}</Link>
              </li>
            ))}
        </ul>
      </nav>
    </header>
  )
}
