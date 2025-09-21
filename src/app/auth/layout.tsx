import Head from "../(site)/head"
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>
  {Head("CRC - Carrer Resources Center")}
  {children}
  </>
}
