"use client";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Set the worker source to use the local worker file
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"; 

const PDFViewerClient = ( ) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () =>
    setPageNumber(pageNumber - 1 <= 1 ? 1 : pageNumber - 1);

  const goToNextPage = () =>
    setPageNumber(pageNumber + 1 >= numPages ? numPages : pageNumber + 1);

  return (
    <div className="p-8">
      <nav className="mb-4 flex gap-4 items-center">
        <button
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          className={`px-4 py-2 text-white border-none rounded cursor-pointer ${
            pageNumber <= 1 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Prev
        </button>
        <button
          onClick={goToNextPage}
          disabled={pageNumber >= numPages}
          className={`px-4 py-2 text-white border-none rounded cursor-pointer ${
            pageNumber >= numPages 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Next
        </button>
        <p className="m-0 font-bold text-gray-800">
          Page {pageNumber} of {numPages || "..."}
        </p>
      </nav>

      <div className="border border-gray-300 rounded overflow-hidden flex justify-center">
        <Document
          file="/images/pdfs/test.pdf"
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="p-8 text-center">
              Loading PDF...
            </div>
          }
          error={
            <div className="p-8 text-center text-red-600">
              Failed to load PDF. Please make sure the file exists in the public
              folder.
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            width={800}
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewerClient;