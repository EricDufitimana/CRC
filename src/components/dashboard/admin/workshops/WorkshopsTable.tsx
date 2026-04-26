import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/zenith/components/ui/table";
import { Button } from "@/zenith/components/ui/button";
import { Badge } from "@/zenith/components/ui/badge";
import { Edit, Trash2, Calendar, Loader2, ChevronLeft, ChevronRight, MoreVertical, Eye } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/zenith/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/zenith/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/zenith/components/ui/alert-dialog";

type SupabaseWorkshop = {
  id: string;
  title: string;
  description: string;
  presentation_url?: string;
  date: string;
  has_assignment: boolean;
  crc_classes: { id: string; name: string; grade_group: string }[];
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

  const getGradeGroupColor = (gradeGroup: string) => {
    switch (gradeGroup) {
      case 'Enrichment_Year':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Senior_4':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Senior_5':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Senior_6':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-200';
    }
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
              <TableHead>Classes</TableHead>
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
                <TableCell><div className="h-6 bg-gray-100 rounded-full w-24 animate-pulse" /></TableCell>
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
            <TableHead>Classes</TableHead>
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
                <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                  {workshop.crc_classes?.map((c) => (
                    <Badge 
                      key={c.id} 
                      variant="outline" 
                      className={cn(
                        "text-[10px] px-2 py-0.5 border font-medium rounded-md shadow-sm",
                        getGradeGroupColor(c.grade_group)
                      )}
                    >
                      {c.name}
                    </Badge>
                  ))}
                  {(!workshop.crc_classes || workshop.crc_classes.length === 0) && (
                    <span className="text-[10px] text-gray-300 italic">None</span>
                  )}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-none hover:bg-transparent bg-transparent">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(workshop)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {workshop.has_assignment && (
                      <DropdownMenuItem onClick={() => onViewAssignment(workshop)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Assignment
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600"
                      onClick={() => onDelete(workshop.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
