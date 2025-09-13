"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import PdfViewer from "@/components/PdfViewer/PdfViewer"

export default function HomePage() {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchSignedUrl() {
    setLoading(true)
    try {
      console.log("Fetching signed URL for:", "test/National Exam Results Eric Dufitimana.pdf")
      
      const res = await fetch("/api/workshops/get-signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: "test/National Exam Results Eric Dufitimana.pdf",
          bucket: "presentation_pdfs",
          expiresIn: 3600
        }),
      })

      console.log("Response status:", res.status)
      
      if (!res.ok) {
        const errorData = await res.json()
        console.error("API Error:", errorData)
        alert(`Error: ${errorData.error || 'Failed to fetch signed URL'}`)
        return
      }

      const data = await res.json()
      console.log("API Response:", data)
      
      if (data.signedUrl) {
        setSignedUrl(data.signedUrl)
        console.log("Signed URL set:", data.signedUrl)
      } else {
        console.error("No signed URL in response:", data)
        alert("No signed URL received from server")
      }
    } catch (err) {
      console.error("Error fetching signed URL:", err)
      alert(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignedUrl()
  }, [])

  return (
    <div className="flex items-center justify-center h-screen">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            onClick={fetchSignedUrl}
            disabled={loading}
            className="px-6 py-3 text-lg rounded-xl"
          >
            {loading ? "Loading..." : "Open Presentation"}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl w-full h-[90vh]">
          <DialogHeader>
            <DialogTitle>Presentation PDF</DialogTitle>
          </DialogHeader>

          {signedUrl ? (
            <iframe
              src={signedUrl}
              className="w-full h-full rounded-md border"
            />
          ) : (
            <p className="p-4 text-gray-500">No PDF loaded yet.</p>
          )}
        </DialogContent>
      </Dialog>
      <PdfViewer />
    </div>
  )
}
