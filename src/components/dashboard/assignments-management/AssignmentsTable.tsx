"use client";

import { useState } from "react";
import { Button } from "../../../../zenith/src/components/ui/button";
import { Input } from "../../../../zenith/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../zenith/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../zenith/src/components/ui/table";
import { Clock, ArrowUpRight, ChevronLeft, ChevronRight, FileText } from "lucide-react";

interface Row {
  student_id: string;
  name: string;
  email: string;
  status: "submitted" | "not_yet_submitted";
  submitted_at: string | null;
  submission_type: string;
  on_time: boolean | null;
  google_doc_link?: string | null;
  file_upload_link?: string | null;
  view_url?: string | null;
}

interface AssignmentsTableProps {
  rows: Row[];
  signedUrls: Record<string, string>;
  loadingUrls: Record<string, boolean>;
  onGetSignedUrl: (filePath: string, studentId: string) => Promise<string | undefined>;
  onSelectSubmission: (row: Row) => void;
  submissionType?: string;
}

export function AssignmentsTable({
  rows,
  signedUrls,
  loadingUrls,
  onGetSignedUrl,
  onSelectSubmission,
  submissionType,
}: AssignmentsTableProps) {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'not_yet_submitted'>('all');
  const [filterOnTime, setFilterOnTime] = useState<'all' | 'on_time' | 'late'>('all');
  const [page, setPage] = useState(1);
  const rowsPerPage = 15;

  const filteredRows = rows.filter((row) => {
    const searchMatch = !query || 
      row.name?.toLowerCase().includes(query.toLowerCase()) ||
      row.email?.toLowerCase().includes(query.toLowerCase()) ||
      row.status?.toLowerCase().includes(query.toLowerCase());
    
    const statusMatch = filterStatus === 'all' || row.status === filterStatus;
    const onTimeMatch = filterOnTime === 'all' || 
      (filterOnTime === 'on_time' && row.on_time === true) ||
      (filterOnTime === 'late' && row.on_time === false);
    
    return searchMatch && statusMatch && onTimeMatch;
  });

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const renderSubmissionType = (row: Row) => {
    if (row.status !== 'submitted') return <span className="text-neutral-500">N/A</span>;
    const late = row.on_time === false;
    const hasFileUpload = !!row.file_upload_link;
    const hasGoogleDoc = row.submission_type === 'Google link' && row.google_doc_link;
    
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Clock className={`h-4 w-4 ${late ? 'text-red-600' : 'text-emerald-600'}`} />
          <span className="text-sm text-neutral-600">{late ? 'Late submit' : 'On time'}</span>
        </div>
        {hasFileUpload ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-black hover:text-gray-700 bg-gray-100 hover:translate-x-0.5 hover:-translate-y-0.5"
            title="View submission image"
            onClick={() => {
              onSelectSubmission(row);
              if (row.file_upload_link) {
                const urlKey = `${row.student_id}-${row.file_upload_link}`;
                if (!signedUrls[urlKey]) {
                  onGetSignedUrl(row.file_upload_link, row.student_id);
                }
              }
            }}
          >
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 hover:translate-x-0.5 hover:-translate-y-0.5" />
          </Button>
        ) : hasGoogleDoc ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-black hover:text-gray-500"
            title="Open Google Doc"
            onClick={() => window.open(row.google_doc_link as string, '_blank', 'noopener,noreferrer')}
          >
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 hover:translate-x-0.5 hover:-translate-y-0.5" />
          </Button>
        ) : row.view_url ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-black hover:text-gray-500"
            title="Open submission"
            onClick={() => window.open(row.view_url as string, '_blank', 'noopener,noreferrer')}
          >
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 hover:translate-x-0.5 hover:-translate-y-0.5" />
          </Button>
        ) : (
          <div className="h-8 w-8 flex items-center justify-center text-neutral-300">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        )}
      </div>
    );
  };

  // Get most common submission type
  const submittedRows = rows.filter(row => row.status === 'submitted');
  const submissionTypes = submittedRows.map(row => row.submission_type);
  const typeCounts = submissionTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonType = Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];
  
  let displayText = '';
  if (mostCommonType) {
    switch (mostCommonType.toLowerCase()) {
      case 'google link':
        displayText = 'Google Doc';
        break;
      case 'file upload':
        displayText = 'File Upload';
        break;
      case 'text':
        displayText = 'Text Input';
        break;
      default:
        displayText = mostCommonType.charAt(0).toUpperCase() + mostCommonType.slice(1);
    }
  }

  return (
    <div className="space-y-3">
      <div className="pb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-medium">Assignment submission status</h2>
          {displayText && (
            <div className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Submission style: {displayText}
            </div>
          )}
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-64">
          <Input
            value={query}
            onChange={(e) => {
              setPage(1);
              setQuery(e.target.value);
            }}
            placeholder="Search student, email, status..."
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => { 
          setPage(1); 
          setFilterStatus(v as any); 
        }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="not_yet_submitted">Not yet submitted</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterOnTime} onValueChange={(v) => { 
          setPage(1); 
          setFilterOnTime(v as any); 
        }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="On-time" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All timing</SelectItem>
            <SelectItem value="on_time">On time</SelectItem>
            <SelectItem value="late">Late</SelectItem>
          </SelectContent>
        </Select>
        {(query || filterStatus !== 'all' || filterOnTime !== 'all') && (
          <Button variant="ghost" size="sm" onClick={() => { 
            setQuery(""); 
            setFilterStatus('all'); 
            setFilterOnTime('all'); 
            setPage(1); 
          }}>
            Clear filters
          </Button>
        )}
      </div>
      <div className="rounded-lg border overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Submission Status</TableHead>
              <TableHead>Assignment Submit Date</TableHead>
              <TableHead>Submission Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-neutral-500 py-8">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((r) => (
                <TableRow key={r.student_id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{r.name || 'Unknown'}</span>
                      <span className="text-xs text-neutral-500">{r.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          r.status === 'submitted' ? 'bg-green-500' : 'bg-orange-400'
                        }`}
                      />
                      <span className="text-sm text-neutral-600">
                        {r.status === 'submitted' ? 'Submitted' : 'Not yet submitted'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-600">
                    {r.submitted_at
                      ? new Date(r.submitted_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-600">{renderSubmissionType(r)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs text-neutral-600">Page {page} of {totalPages}</div>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

