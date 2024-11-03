import '@/styles/globals.css'
import { Providers } from './providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'

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
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
} 