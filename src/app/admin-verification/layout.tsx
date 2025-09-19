import '@/styles/index.css';

export const metadata = {
  title: 'Admin Verification - CRC Platform',
  description: 'Admin verification in progress. Please wait while we verify your account status.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
