import "../../styles/index.css";

export const metadata = {
  title: 'CRC - Career Resources Center',
  description: 'Career Resources Center Website',
  icons: {
    icon: "/images/logo/logo.svg",
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div suppressHydrationWarning={true}>
      {children}
    </div>
  )
}
