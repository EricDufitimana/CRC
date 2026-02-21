"use client";

import { Button } from "@/zenith/components/ui/button";
import { Badge } from "@/zenith/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/zenith/components/ui/table";
import { Edit, PowerOff, FileText, Trash2, MoreVertical, Eye } from "lucide-react";
import { Resource } from "./types";
import { EmptyState } from "@/components/ui/empty-state";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/zenith/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/zenith/components/ui/alert-dialog";

interface ContentTableProps {
  resources: Resource[];
  loading: boolean;
  onEdit: (resource: Resource) => void;
  onDeactivate: (resourceId: string) => void;
  onReactivate: (resourceId: string) => void;
  onDelete: (resourceId: string) => void;
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
  onDelete,
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
      <div className="py-8">
        <EmptyState
          image="/images/empty-state/empty-resources.svg"
          headerText="No resources found"
          subtext="Get started by adding your first resource to this category."
          imageClassName="mr-4 w-48 h-48 "
          imageSize="custom"
        />
      </div>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-none hover:bg-transparent bg-transparent">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(resource)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {resource.status === 'active' ? (
                      <>
                        <DropdownMenuItem onClick={() => onDeactivate(resource.id.toString())} className="text-orange-600 focus:text-orange-600">
                          <PowerOff className="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onSelect={(e) => {
                                e.preventDefault();
                                onDelete(resource.id.toString());
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the resource &quot;{resource.title}&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(resource.id.toString())}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete Resource
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => onReactivate(resource.id.toString())} className="text-green-600 focus:text-green-600">
                          <PowerOff className="h-4 w-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onSelect={(e) => {
                                e.preventDefault();
                                onDelete(resource.id.toString());
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the resource &quot;{resource.title}&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(resource.id.toString())}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete Resource
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
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

