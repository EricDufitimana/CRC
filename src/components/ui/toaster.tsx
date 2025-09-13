import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, className, ...props }) {
        return (
          <Toast key={id} {...props} className={className}>
            <div className="flex items-center justify-between w-full relative z-10">
              <div className="flex items-center gap-3">
                {action}
                <div>
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
              </div>
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="!fixed !top-16 !left-0 z-[100] flex max-h-screen w-full flex-col p-4 md:max-w-[420px] !bottom-auto !right-auto" />
    </ToastProvider>
  )
}
