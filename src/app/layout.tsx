import '@/styles/globals.css'

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
      <body>{children}</body>
    </html>
  )
} 