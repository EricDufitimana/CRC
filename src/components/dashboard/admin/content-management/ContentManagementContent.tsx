"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/zenith/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/zenith/components/ui/dialog";
import { X } from "@phosphor-icons/react";
import { showToastPromise } from "@/components/toasts";
import { ContentManagementHeader } from "./ContentManagementHeader";
import { ContentCategorySidebar } from "./ContentCategorySidebar";
import { ContentTable } from "./ContentTable";
import { AddResourceDialog } from "./AddResourceDialog";
import { EditResourceDialog } from "./EditResourceDialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { Resource } from "./types";

const categories = [
  { id: "new-opportunities", label: "New Opportunities" },
  { id: "recurring-opportunities", label: "Recurring Opportunities" },
  { id: "templates", label: "Templates" },
  { id: "english-learning", label: "English Learning" },
];

export function ContentManagementContent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get category from URL params or default to new-opportunities
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const categoryFromUrl = searchParams?.get('category');
    return categoryFromUrl || "new-opportunities";
  });

  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [resourceIdToDelete, setResourceIdToDelete] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'deactivate' | 'delete'>('deactivate');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Only allow resource creation for these categories
  const validResourceCategories = [
    "new-opportunities",
    "recurring-opportunities",
    "templates",
    "english-learning",
  ];
  const canAddResource = validResourceCategories.includes(selectedCategory);

  // Fetch resources using tRPC
  const { data: resources = [], isFetching } = useQuery(
    trpc.contentManagement.getResourcesByCategory.queryOptions({
      category: selectedCategory as 'new-opportunities' | 'recurring-opportunities' | 'templates' | 'english-learning',
    })
  );

  // Mutations
  const deactivateResourceMutation = useMutation({
    ...trpc.resources.deactivate.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [['contentManagement', 'getResourcesByCategory']],
      });
      queryClient.invalidateQueries({
        queryKey: [['resources', 'getByCategory']],
      });
      setDeleteConfirmationOpen(false);
      setResourceIdToDelete(null);
    },
  });

  const reactivateResourceMutation = useMutation({
    ...trpc.resources.reactivate.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [['contentManagement', 'getResourcesByCategory']],
      });
      queryClient.invalidateQueries({
        queryKey: [['resources', 'getByCategory']],
      });
    },
  });

  const deleteResourceMutation = useMutation({
    ...trpc.resources.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [['contentManagement', 'getResourcesByCategory']],
      });
      queryClient.invalidateQueries({
        queryKey: [['resources', 'getByCategory']],
      });
      setDeleteConfirmationOpen(false);
      setResourceIdToDelete(null);
    },
  });

  // Update URL when category changes
  const updateCategoryInUrl = (category: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('category', category);
    router.push(`?${params.toString()}`);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateCategoryInUrl(category);
  };

  // Reset to first page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(resources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResources = resources.slice(startIndex, endIndex);

  // Helper to get category label
  function categoryLabelFor(cat: string) {
    const category = categories.find(c => c.id === cat);
    return category ? category.label : cat;
  }

  const handleDeactivateClick = (resourceId: string) => {
    setResourceIdToDelete(resourceId);
    setDeleteType('deactivate');
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteClick = (resourceId: string) => {
    setResourceIdToDelete(resourceId);
    setDeleteType('delete');
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (resourceIdToDelete) {
      if (deleteType === 'deactivate') {
        const promise = deactivateResourceMutation.mutateAsync({
          id: resourceIdToDelete,
        });

        showToastPromise({
          promise,
          loadingText: 'Deactivating resource...',
          successText: 'The resource has been removed from the website',
          successHeaderText: 'Resource Deactivated Successfully',
          errorText: 'We couldn\'t deactivate resource. Please try again or contact support.',
          errorHeaderText: 'Failed To Deactivate Resource',
          direction: 'right'
        });
      } else {
        const promise = deleteResourceMutation.mutateAsync({
          id: resourceIdToDelete,
        });

        showToastPromise({
          promise,
          loadingText: 'Deleting resource...',
          successText: 'The resource has been permanently deleted',
          successHeaderText: 'Resource Deleted Successfully',
          errorText: 'We couldn\'t delete resource. Please try again or contact support.',
          errorHeaderText: 'Failed To Delete Resource',
          direction: 'right'
        });
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(false);
    setResourceIdToDelete(null);
  };

  const handleEditClick = (resource: Resource) => {
    setResourceToEdit(resource);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setResourceToEdit(null);
  };

  const handleReactivateResource = (id: string) => {
    const promise = reactivateResourceMutation.mutateAsync({
      id,
    });

    showToastPromise({
      promise,
      loadingText: 'Reactivating resource...',
      successText: 'The resource is now visible on the website',
      successHeaderText: 'Resource Reactivated Successfully',
      errorText: 'We couldn\'t reactivate the resource. Please try again or contact support.',
      errorHeaderText: 'Failed To Reactivate Resource',
      direction: 'right'
    });
  };

  return (
    <div className="p-8">
      <div className="space-y-6">
        {/* Header */}
        <ContentManagementHeader />

        {/* Top Horizontal Navigation */}
        <ContentCategorySidebar
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          isAddResourceOpen={isAddResourceOpen}
          onAddResourceOpenChange={setIsAddResourceOpen}
          canAddResource={canAddResource}
        />

        {/* Main Content Area - Full Width */}
        <div className="w-full">
          <div className="space-y-6">
            {/* Resources Table */}
            <Card className="border-none shadow-none bg-transparent">

              <CardContent className="px-0">
                <ContentTable
                  resources={currentResources}
                  loading={isFetching}
                  onEdit={handleEditClick}
                  onDeactivate={handleDeactivateClick}
                  onReactivate={handleReactivateResource}
                  onDelete={handleDeleteClick}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalResources={resources.length}
                  onPageChange={setCurrentPage}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Resource Dialog */}
      <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
        <DialogContent
          className="max-w-3xl rounded-[40px] sm:rounded-[40px] overflow-hidden border-none shadow-2xl p-8
          "
          closeButton={
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
              <span className="sr-only">Close</span>
            </button>
          }
        >
          <AddResourceDialog
            key={`${selectedCategory}-${isAddResourceOpen ? "open" : "closed"}`}
            selectedCategory={selectedCategory}
            canAddResource={canAddResource}
            onClose={() => setIsAddResourceOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent
          className="max-w-3xl rounded-[40px] sm:rounded-[40px] overflow-hidden border-none shadow-2xl p-8"
          closeButton={
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
              <span className="sr-only">Close</span>
            </button>
          }
        >
          <EditResourceDialog
            resource={resourceToEdit}
            onClose={handleEditClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteConfirmationOpen}
        onOpenChange={setDeleteConfirmationOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmationOpen(false);
          setResourceIdToDelete(null);
        }}
        deleteType={deleteType}
        isLoading={deleteType === 'deactivate' ? deactivateResourceMutation.isPending : deleteResourceMutation.isPending}
      />
    </div>
  );
}
