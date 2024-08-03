import './globals.css'

export const metadata = {
  title: 'KOL Instagram Engagement Tracker',
  description: 'Track and analyze Instagram post engagement',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}