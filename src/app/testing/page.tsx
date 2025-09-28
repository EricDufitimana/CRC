"use client"

import { useState } from "react"
import { FileUpload } from "../../../zenith/src/components/ui/file-upload"
import { Button } from "../../../zenith/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../zenith/src/components/ui/card"
import { Loader2, FileText, CheckCircle, XCircle } from "lucide-react"

export default function TestingPage() {
  const [selectedFile, setSelectedFile] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [useApi, setUseApi] = useState(false)
  const [useTableExtraction, setUseTableExtraction] = useState(true)
  const [useEdgeFunction, setUseEdgeFunction] = useState(false)
  const [useTesseract, setUseTesseract] = useState(false)
  const [useEdgeFunctionAI, setUseEdgeFunctionAI] = useState(false)

  const handleFileUpload = async () => {
    if (selectedFile.length === 0) {
      setError("Please select a file first")
      return
    }

    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile[0])

      let endpoint: string
      if (useTesseract) {
        endpoint = '/api/tesseract-extraction'
      } else if (useEdgeFunction) {
        endpoint = '/api/test-score-extraction' // This will call the scan_report_card Edge Function (Vision)
      } else if (useEdgeFunctionAI) {
        endpoint = '/api/test-scan-report-ai' // This will call the scan_report_card_ai Edge Function (AI)
      } else if (useApi) {
        endpoint = useTableExtraction ? '/api/test-pdf-table-extraction' : '/api/test-pdf-extraction'
      } else {
        endpoint = '/api/test-scan-report' // This will call the scan_report Edge Function (Basic)
      }
      
      console.log('🚀 Using endpoint:', endpoint, 'Method:', useTesseract ? 'Tesseract OCR' : useEdgeFunction ? 'Edge Function (Vision)' : useEdgeFunctionAI ? 'Edge Function (AI)' : useApi ? 'API Route' : 'Edge Function (Basic)', 'Table Extraction:', useTableExtraction)

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response not OK:', errorText)
        setError(`Server error (${response.status}): ${errorText}`)
        return
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text()
        console.error('❌ Not JSON response:', errorText)
        setError(`Invalid response format: ${errorText.substring(0, 200)}...`)
        return
      }

      const data = await response.json()
      console.log('📊 Response data:', data)

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to extract score')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Academic Report Score Extraction Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Academic Report
                </label>
                <FileUpload
                  multiple={false}
                  accept={useTesseract ? ".pdf,.png,.jpg,.jpeg,.gif,.bmp,.tiff" : ".pdf,.docx"}
                  value={selectedFile}
                  onChange={(files: File[]) => {
                    setSelectedFile(files)
                    setError(null)
                    setResult(null)
                  }}
                  placeholder="Drop your academic report here or click to upload"
                  helperText={useTesseract ? "PDF or image files (PNG, JPG, JPEG, GIF, BMP, TIFF)" : "PDF or DOCX files only"}
                />
              </div>

              {/* Method Selection */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Processing Method:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="tesseract-ocr"
                      name="method"
                      checked={useTesseract}
                      onChange={() => {
                        setUseTesseract(true)
                        setUseApi(false)
                        setUseEdgeFunction(false)
                        setUseEdgeFunctionAI(false)
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="tesseract-ocr" className="text-sm text-gray-700">
                      Tesseract OCR
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="edge-function-vision"
                      name="method"
                      checked={useEdgeFunction}
                      onChange={() => {
                        setUseEdgeFunction(true)
                        setUseApi(false)
                        setUseTesseract(false)
                        setUseEdgeFunctionAI(false)
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="edge-function-vision" className="text-sm text-gray-700">
                      Edge Function (Vision)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="edge-function-ai"
                      name="method"
                      checked={useEdgeFunctionAI}
                      onChange={() => {
                        setUseEdgeFunctionAI(true)
                        setUseApi(false)
                        setUseTesseract(false)
                        setUseEdgeFunction(false)
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="edge-function-ai" className="text-sm text-gray-700">
                      Edge Function (AI)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="edge-function"
                      name="method"
                      checked={!useApi && !useEdgeFunction && !useTesseract && !useEdgeFunctionAI}
                      onChange={() => {
                        setUseApi(false)
                        setUseEdgeFunction(false)
                        setUseTesseract(false)
                        setUseEdgeFunctionAI(false)
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="edge-function" className="text-sm text-gray-700">
                      Edge Function (Basic)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="api-route"
                      name="method"
                      checked={useApi}
                      onChange={() => {
                        setUseApi(true)
                        setUseEdgeFunction(false)
                        setUseTesseract(false)
                        setUseEdgeFunctionAI(false)
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="api-route" className="text-sm text-gray-700">
                      API Route
                    </label>
                  </div>
                </div>

                {/* Extraction Method Selection (only for API Route) */}
                {useApi && (
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Extraction Method:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="table-extraction"
                        name="extraction"
                        checked={useTableExtraction}
                        onChange={() => setUseTableExtraction(true)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="table-extraction" className="text-sm text-gray-700">
                        Table Parser (PDF only)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="text-extraction"
                        name="extraction"
                        checked={!useTableExtraction}
                        onChange={() => setUseTableExtraction(false)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="text-extraction" className="text-sm text-gray-700">
                        Text Parser (PDF & DOCX)
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleFileUpload}
                disabled={selectedFile.length === 0 || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Report...
                  </>
                ) : (
                  `Extract Score (${useTesseract ? 'Tesseract OCR' : useEdgeFunction ? 'Edge Function (Vision)' : useEdgeFunctionAI ? 'Edge Function (AI)' : useApi ? `API Route - ${useTableExtraction ? 'Table Parser' : 'Text Parser'}` : 'Edge Function (Basic)'})`
                )}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 font-medium">Error</span>
                </div>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-700 font-medium">Score Extracted Successfully</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.average && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <h3 className="font-medium text-blue-900 mb-2">Extracted Average</h3>
                      <p className="text-2xl font-bold text-blue-700">{result.average}</p>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">Processing Method</h3>
                    <p className="text-sm text-gray-600">{result.method || (useTesseract ? 'Tesseract OCR' : useEdgeFunction ? 'Edge Function (Vision)' : useApi ? 'API Route' : 'Edge Function (Basic)')}</p>
                  </div>

                  {result.confidence && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <h3 className="font-medium text-green-900 mb-2">Confidence</h3>
                      <p className="text-2xl font-bold text-green-700">
                        {(() => {
                          const confidence = result.confidence;
                          if (typeof confidence === 'number') {
                            return confidence.toFixed(2);
                          }
                          const parsed = parseFloat(confidence);
                          return isNaN(parsed) ? 'N/A' : parsed.toFixed(2);
                        })()}%
                      </p>
                    </div>
                  )}

                  {result.pageCount && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
                      <h3 className="font-medium text-purple-900 mb-2">Pages Processed</h3>
                      <p className="text-2xl font-bold text-purple-700">{result.pageCount}</p>
                    </div>
                  )}
                </div>

                {(result.extractedText || result.text) && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">Extracted Text Preview</h3>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {result.extractedText || result.text}
                    </pre>
                  </div>
                )}

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h3 className="font-medium text-gray-900 mb-2">Full Response</h3>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}