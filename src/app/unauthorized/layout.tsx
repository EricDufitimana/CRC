import '@/styles/index.css';

export const metadata = {
  title: 'Unauthorized Access - CRC Platform',
  description: 'You do not have permission to access this area. Please contact support if you believe this is an error.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
