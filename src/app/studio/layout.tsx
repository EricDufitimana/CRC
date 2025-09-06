export const metadata = {
  title: 'CRC - Career Resources Center',
  description: 'Career Resources Center Website',
  icons: {
    icon: "/images/logo/favicon.svg",
  },
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
