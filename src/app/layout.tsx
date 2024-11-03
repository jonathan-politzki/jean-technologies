import '@/styles/globals.css'
import AuthGuard from '@/components/AuthGuard'

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
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  )
} 