import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/zenith/components/ui/table";
import { Button } from "@/zenith/components/ui/button";
import { Badge } from "@/zenith/components/ui/badge";
import { Edit, Trash2, Calendar, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

type SupabaseWorkshop = {
  id: string;
  title: string;
  description: string;
  presentation_url?: string;
  date: string;
  has_assignment: boolean;
};

interface WorkshopsTableProps {
  workshops: SupabaseWorkshop[];
  loading: boolean;
  onEdit: (workshop: SupabaseWorkshop) => void;
  onDelete: (workshopId: string) => void;
  onViewAssignment: (workshop: SupabaseWorkshop) => void;
  deletingWorkshopId: string | null;
}

export function WorkshopsTable({
  workshops,
  loading,
  onEdit,
  onDelete,
  onViewAssignment,
  deletingWorkshopId,
}: WorkshopsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><div className="h-5 bg-gray-100 rounded-lg w-36 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-gray-100 rounded-lg w-48 animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-gray-100 rounded-lg w-24 animate-pulse" /></TableCell>
                <TableCell><div className="h-6 bg-gray-100 rounded-full w-12 animate-pulse" /></TableCell>
                <TableCell><div className="flex justify-end gap-2"><div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse" /><div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse" /></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (workshops.length === 0) {
    return (
      <div className="py-8">
        <EmptyState
          image="/images/empty-state/empty-workshops.svg"
          headerText="No workshops found"
          subtext="Get started by adding your first workshop to this category."
          imageClassName="-ml-8 w-48 h-48"
          imageSize="custom"
        />
      </div>
    );
  }

  const totalPages = Math.ceil(workshops.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWorkshops = workshops.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Assignment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedWorkshops.map((workshop) => (
            <TableRow key={workshop.id}>
              <TableCell className="font-medium text-gray-900">{workshop.title}</TableCell>
              <TableCell className="max-w-xs truncate text-gray-500">{workshop.description}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(workshop.date)}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  className={`cursor-pointer transition-all ${workshop.has_assignment
                    ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                    }`}
                  onClick={() => workshop.has_assignment && onViewAssignment(workshop)}
                >
                  {workshop.has_assignment ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(workshop)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(workshop.id)}
                    disabled={deletingWorkshopId === workshop.id}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingWorkshopId === workshop.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4 border-t">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, workshops.length)} of {workshops.length} workshops
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
