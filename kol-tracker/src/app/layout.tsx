import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'KOL Instagram Engagement Tracker',
  description: 'Track and analyze Instagram post engagement',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}