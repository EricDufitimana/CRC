import '@/styles/index.css';
import Head from "../(site)/head"
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>
  {Head("Account Verification")}
  {children}
  </>
}
