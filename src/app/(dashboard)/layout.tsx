import "../../styles/index.css";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

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
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  )
}
