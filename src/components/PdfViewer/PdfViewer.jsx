"use client";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useState } from "react";

const PdfViewer = ({ pdfUrl }) => {
  const [error, setError] = useState(null);
  const [showFallback, setShowFallback] = useState(false);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  
  // Check if URL is valid
  if (!pdfUrl || pdfUrl.trim() === '') {
    return (
      <div className="h-[300px] w-full border rounded-md flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No PDF URL provided</p>
      </div>
    );
  }

  // Check if it's a Google Drive URL
  const isGoogleDriveUrl = pdfUrl.includes('drive.google.com');

  // For Google Drive URLs, show fallback immediately since they don't work well with PDF viewers
  if (isGoogleDriveUrl) {
    return (
      <div className="h-[300px] w-full border rounded-md flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Google Drive PDF</p>
          <p className="text-gray-500 text-sm mb-4">PDF viewers cannot display Google Drive files directly</p>
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Open in Google Drive
          </a>
        </div>
      </div>
    );
  }

  // Fallback component for when PDF viewer fails
  if (showFallback) {
    return (
      <div className="h-[300px] w-full border rounded-md flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-2">PDF Viewer Unavailable</p>
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Open PDF
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full border rounded-md relative">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={pdfUrl}
          plugins={[defaultLayoutPluginInstance]}
          onError={(error) => {
            console.error("PDF Viewer Error:", error);
            setError(error);
            setShowFallback(true);
          }}
        />
      </Worker>
      {error && (
        <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-md flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-medium">PDF Error</p>
            <p className="text-red-500 text-sm">Unable to load PDF</p>
            <button 
              onClick={() => setShowFallback(true)}
              className="text-blue-600 text-sm underline mt-2"
            >
              Use fallback
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;