"use client"

import { useState } from "react"
import { FileUpload } from "../../../zenith/src/components/ui/file-upload"
import { Button } from "../../../zenith/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../zenith/src/components/ui/card"
import { Loader2, Users, Upload, CheckCircle, XCircle } from "lucide-react"

export default function TestingPage() {
  const [bulkImportFile, setBulkImportFile] = useState<File[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)
  const [bulkResult, setBulkResult] = useState<any>(null)
  const [bulkError, setBulkError] = useState<string | null>(null)

  const handleBulkImport = async () => {
    if (bulkImportFile.length === 0) {
      setBulkError("Please select a file first")
      return
    }

    setIsBulkProcessing(true)
    setBulkError(null)
    setBulkResult(null)

    try {
      const formData = new FormData()
      formData.append('file', bulkImportFile[0])

      console.log('🚀 Processing bulk import file:', bulkImportFile[0].name)

      const response = await fetch('/api/bulk-import-names', {
        method: 'POST',
        body: formData,
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response not OK:', errorText)
        setBulkError(`Server error (${response.status}): ${errorText}`)
        return
      }

      const data = await response.json()
      console.log('📊 Response data:', data)
      console.log('📊 Extracted data:', data.extractedData)

      if (data.success) {
        setBulkResult(data)
      } else {
        setBulkError(data.error || 'Failed to extract names')
      }
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsBulkProcessing(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bulk Import Names Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document (Excel, CSV, PDF, etc.)
                </label>
                <FileUpload
                  multiple={false}
                  accept=".xlsx,.xls,.csv,.pdf,.docx,.txt"
                  value={bulkImportFile}
                  onChange={(files: File[]) => {
                    setBulkImportFile(files)
                    setBulkError(null)
                    setBulkResult(null)
                  }}
                  placeholder="Drop your document here or click to upload"
                  helperText="Excel, CSV, PDF, DOCX, or TXT files"
                />
              </div>

              <Button 
                onClick={handleBulkImport}
                disabled={bulkImportFile.length === 0 || isBulkProcessing}
                className="w-full"
              >
                {isBulkProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Document...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Extract Names
                  </>
                )}
              </Button>
            </div>

            {bulkError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 font-medium">Error</span>
                </div>
                <p className="text-red-600 mt-1">{bulkError}</p>
              </div>
            )}

            {bulkResult && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-700 font-medium">Names Extracted Successfully</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h3 className="font-medium text-blue-900 mb-2">Total Names Found</h3>
                    <p className="text-2xl font-bold text-blue-700">{bulkResult.names?.length || 0}</p>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">Confidence</h3>
                    <p className="text-sm text-gray-600">{(bulkResult.confidence * 100).toFixed(1)}%</p>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">Processing Time</h3>
                    <p className="text-sm text-gray-600">{bulkResult.processingTime}ms</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h3 className="font-medium text-gray-900 mb-2">Extraction Method</h3>
                  <p className="text-sm text-gray-600">{bulkResult.reasoning}</p>
                </div>

                {/* Debug Section */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <h3 className="font-medium text-red-900 mb-2">Debug Info</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Has extractedData:</strong> {bulkResult.extractedData ? 'Yes' : 'No'}</p>
                    <p><strong>File Type:</strong> {bulkResult.extractedData?.fileType || 'Not available'}</p>
                    <p><strong>Sheets Count:</strong> {bulkResult.extractedData?.sheets?.length || 0}</p>
                    <p><strong>Response Keys:</strong> {Object.keys(bulkResult).join(', ')}</p>
                  </div>
                </div>

                {bulkResult.names && bulkResult.names.length > 0 && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">Extracted Names</h3>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {bulkResult.names.map((name: string, index: number) => (
                          <div key={index} className="p-2 bg-white border rounded text-sm">
                            {name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Excel Data Display */}
                {bulkResult.extractedData && bulkResult.extractedData.fileType === 'Excel' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Excel File Analysis</h3>
                    
                    {bulkResult.extractedData.sheets?.map((sheet: any, sheetIndex: number) => (
                      <div key={sheetIndex} className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <h4 className="font-medium text-yellow-900 mb-2">
                          Sheet: {sheet.sheetName} ({sheet.rowCount} rows)
                        </h4>
                        
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">All Cells Content:</h5>
                            <div className="max-h-32 overflow-y-auto bg-white p-2 rounded border">
                              <div className="flex flex-wrap gap-1">
                                {sheet.allCells?.map((cell: any, cellIndex: number) => (
                                  <span key={cellIndex} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                    {String(cell)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Raw Data (First 10 rows):</h5>
                            <div className="max-h-40 overflow-y-auto bg-white p-2 rounded border">
                              <pre className="text-xs text-gray-600">
                                {JSON.stringify(sheet.rawData?.slice(0, 10), null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CSV Data Display */}
                {bulkResult.extractedData && bulkResult.extractedData.fileType === 'CSV' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">CSV File Analysis</h3>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <h4 className="font-medium text-green-900 mb-2">
                        CSV Structure ({bulkResult.extractedData.csvData?.length || 0} rows)
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Headers:</h5>
                          <div className="flex flex-wrap gap-1">
                            {bulkResult.extractedData.headers?.map((header: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-green-100 rounded text-xs">
                                {header}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Sample Data (First 5 rows):</h5>
                          <div className="max-h-40 overflow-y-auto bg-white p-2 rounded border">
                            <pre className="text-xs text-gray-600">
                              {JSON.stringify(bulkResult.extractedData.csvData?.slice(0, 5), null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Text Extraction Display */}
                {bulkResult.extractedData && bulkResult.extractedData.textExtraction && bulkResult.extractedData.fileType !== 'CSV' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h3 className="font-medium text-blue-900 mb-2">Text Extraction</h3>
                    <div className="max-h-40 overflow-y-auto bg-white p-2 rounded border">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {bulkResult.extractedData.textExtraction}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h3 className="font-medium text-gray-900 mb-2">Full Response</h3>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {JSON.stringify(bulkResult, null, 2)}
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