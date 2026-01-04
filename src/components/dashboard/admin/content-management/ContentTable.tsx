"use client";

import { Button } from "@/zenith/components/ui/button";
import { Badge } from "@/zenith/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/zenith/components/ui/table";
import { Edit, PowerOff, FileText } from "lucide-react";
import { Resource } from "./types";

interface ContentTableProps {
  resources: Resource[];
  loading: boolean;
  onEdit: (resource: Resource) => void;
  onDeactivate: (resourceId: string) => void;
  onReactivate: (resourceId: string) => void;
  currentPage: number;
  itemsPerPage: number;
  totalResources: number;
  onPageChange: (page: number) => void;
}

export function ContentTable({
  resources,
  loading,
  onEdit,
  onDeactivate,
  onReactivate,
  currentPage,
  itemsPerPage,
  totalResources,
  onPageChange,
}: ContentTableProps) {
  const totalPages = Math.ceil(totalResources / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              <TableCell>
                <div className="animate-pulse">
                  <div className="h-5 bg-gray-100 rounded-lg w-48 mb-1"></div>
                </div>
              </TableCell>
              <TableCell>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-100 rounded-lg w-64 mb-1"></div>
                </div>
              </TableCell>
              <TableCell>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-100 rounded-lg w-24"></div>
                </div>
              </TableCell>
              <TableCell>
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-100 rounded-full w-16"></div>
                </div>
              </TableCell>
              <TableCell>
                <div className="animate-pulse flex items-center gap-2">
                  <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
                  <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (resources.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No resources found</h3>
                  <p className="text-gray-500 text-sm">
                    Get started by adding your first resource to this category.
                  </p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <TableRow
              key={resource.id}
              className={resource.status === 'inactive' ? 'opacity-60' : ''}
            >
              <TableCell className="font-medium">
                <div className="flex text-md items-center gap-2">
                  {resource.title}
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate text-gray-600">
                {resource.description}
              </TableCell>
              <TableCell>
                {resource.opportunity_deadline ? (
                  <div className="flex items-center gap-1 text-gray-600">
                    {new Date(resource.opportunity_deadline).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-600">
                    No deadline
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    resource.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {resource.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(resource)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {resource.status === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeactivate(resource.id.toString())}
                      className="text-red-600 hover:text-red-700"
                      title="Deactivate resource"
                    >
                      <PowerOff className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReactivate(resource.id.toString())}
                      className="text-green-600 hover:text-green-700"
                    >
                      Activate
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, totalResources)} of {totalResources} resources
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 p-0"
            >
              ←
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 p-0 ${currentPage === page
                      ? "bg-black text-white hover:bg-black/80 hover:text-white border-black"
                      : ""
                    }`}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 p-0"
            >
              →
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

