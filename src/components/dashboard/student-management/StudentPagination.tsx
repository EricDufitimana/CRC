"use client";

import { Button } from "../../../../zenith/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../zenith/src/components/ui/select";
import { ChevronDown } from "lucide-react";

interface StudentPaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  totalResults: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export function StudentPagination({
  currentPage,
  totalPages,
  rowsPerPage,
  totalResults,
  startIndex,
  endIndex,
  onPageChange,
  onRowsPerPageChange,
}: StudentPaginationProps) {
  if (totalResults === 0) return null;

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-white/80 border border-gray-300/80 rounded-lg mt-3 dark:bg-gray-800/80 dark:border-gray-600/80">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-600 dark:text-gray-300">Rows per page:</span>
          <Select 
            value={rowsPerPage.toString()} 
            onValueChange={(value: any) => {
              onRowsPerPageChange(parseInt(value));
              onPageChange(1);
            }}
          >
            <SelectTrigger className="w-16 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10" className="text-xs">10</SelectItem>
              <SelectItem value="15" className="text-xs">15</SelectItem>
              <SelectItem value="25" className="text-xs">25</SelectItem>
              <SelectItem value="50" className="text-xs">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-300">
          Showing {startIndex + 1} to {Math.min(endIndex, totalResults)} of {totalResults} results
        </span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="h-7 w-7 p-0"
        >
          <ChevronDown className="h-3.5 w-3.5 rotate-90" />
        </Button>
        
        <div className="flex items-center gap-0.5">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="h-7 w-7 p-0 text-xs"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="h-7 w-7 p-0"
        >
          <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
        </Button>
      </div>
    </div>
  );
}

