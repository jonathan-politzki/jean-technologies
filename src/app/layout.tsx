import '@/styles/globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Jean Technologies',
  description: 'Understanding users through social data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
} 