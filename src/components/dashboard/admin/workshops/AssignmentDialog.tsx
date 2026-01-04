"use client";

import { useState, useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Label } from "@/zenith/components/ui/label";
import { Textarea } from "@/zenith/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/zenith/components/ui/select";
import { Badge } from "@/zenith/components/ui/badge";
import { showToastSuccess, showToastError, showToastPromise } from "@/components/toasts";
import { Loader2, FileText, Calendar, Upload, Link as LinkIcon, Edit, Trash2, X } from "lucide-react";

interface AssignmentDialogProps {
  workshop: { id: string; title: string } | null;
  mode: "view" | "add" | "edit";
  onClose: () => void;
  onSetMode: (mode: "view" | "add" | "edit") => void;
}

export function AssignmentDialog({ workshop, mode, onClose, onSetMode }: AssignmentDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: assignment, isLoading: fetchingAssignment } = useQuery({
    ...trpc.workshopsManagement.getAssignmentByWorkshopId.queryOptions({ workshopId: workshop?.id || "" }),
    enabled: !!workshop?.id && (mode === "view" || mode === "edit")
  });

  const [form, setForm] = useState({
    workshop_id: workshop?.id || "",
    title: "",
    description: "",
    submission_deadline: "",
    submission_style: "google_link" as "google_link" | "file_upload",
  });

  useEffect(() => {
    if (assignment && mode === "edit") {
      setForm({
        workshop_id: workshop?.id || "",
        title: assignment.title,
        description: assignment.description,
        submission_deadline: new Date(assignment.submission_deadline).toISOString().slice(0, 16),
        submission_style: assignment.submission_style as any,
      });
    } else if (mode === "add") {
       setForm({
        workshop_id: workshop?.id || "",
        title: "",
        description: "",
        submission_deadline: "",
        submission_style: "google_link",
      });
    }
  }, [assignment, mode, workshop]);

  const createAssignmentMutation = useMutation({
    ...trpc.workshopsManagement.createAssignment.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['workshopsManagement', 'getWorkshopsByCategory']] });
      queryClient.invalidateQueries({ queryKey: [['workshopsManagement', 'getAssignmentByWorkshopId']] });
      showToastSuccess({
        headerText: 'Assignment Created',
        paragraphText: 'The assignment has been created successfully',
        direction: 'right'
      });
      onClose();
    },
    onError: (error) => {
      showToastError({
        headerText: 'Creation Failed',
        paragraphText: error.message,
        direction: 'right'
      });
    }
  });

  const updateAssignmentMutation = useMutation({
    ...trpc.workshopsManagement.updateAssignment.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['workshopsManagement', 'getAssignmentByWorkshopId']] });
      showToastSuccess({
        headerText: 'Assignment Updated',
        paragraphText: 'The assignment has been updated successfully',
        direction: 'right'
      });
      onSetMode("view");
    },
    onError: (error) => {
      showToastError({
        headerText: 'Update Failed',
        paragraphText: error.message,
        direction: 'right'
      });
    }
  });

  const deleteAssignmentMutation = useMutation({
    ...trpc.workshopsManagement.deleteAssignment.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['workshopsManagement', 'getWorkshopsByCategory']] });
      showToastSuccess({
        headerText: 'Assignment Deleted',
        paragraphText: 'The assignment has been removed successfully',
        direction: 'right'
      });
      onClose();
    },
    onError: (error) => {
      showToastError({
        headerText: 'Delete Failed',
        paragraphText: error.message,
        direction: 'right'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "add") {
      const promise = createAssignmentMutation.mutateAsync(form);
      showToastPromise({
        promise,
        loadingText: 'Creating assignment...',
        successText: 'Assignment created successfully',
        successHeaderText: 'Success',
        errorText: 'Failed to create assignment',
        errorHeaderText: 'Error',
        direction: 'right'
      });
    } else if (mode === "edit" && assignment) {
      const promise = updateAssignmentMutation.mutateAsync({ ...form, id: assignment.id });
      showToastPromise({
        promise,
        loadingText: 'Updating assignment...',
        successText: 'Assignment updated successfully',
        successHeaderText: 'Success',
        errorText: 'Failed to update assignment',
        errorHeaderText: 'Error',
        direction: 'right'
      });
    }
  };

  const handleDelete = () => {
    if (assignment && workshop) {
      deleteAssignmentMutation.mutate({ assignmentId: assignment.id, workshopId: workshop.id });
    }
  };

  if (fetchingAssignment && (mode === "view" || mode === "edit")) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600 mb-2" />
        <p className="text-gray-500">Loading assignment details...</p>
      </div>
    );
  }

  if (mode === "view" && assignment) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
            <p className="text-sm text-gray-500">Workshop: {workshop?.title}</p>
          </div>
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-light mr-4 text-xs">
            Created {new Date(assignment.created_at).toLocaleDateString()}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Description</Label>
            <p className="text-gray-700 text-sm leading-relaxed">{assignment.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Submission Style</Label>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                {assignment.submission_style === "google_link" ? <LinkIcon className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                <span className="capitalize">{assignment.submission_style.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Deadline</Label>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="h-4 w-4" />
                {new Date(assignment.submission_deadline).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Close</Button>
          <Button 
            variant="outline" 
            onClick={() => onSetMode("edit")}
            className="rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteAssignmentMutation.isPending}
            className="rounded-xl"
          >
            {deleteAssignmentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Assignment Title</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Assignment title"
          required
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Detailed instructions for students..."
          required
          rows={4}
          className="rounded-xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Submission Deadline</Label>
          <Input 
            type="datetime-local" 
            value={form.submission_deadline} 
            onChange={(e) => setForm({ ...form, submission_deadline: e.target.value })} 
            required 
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Submission Style</Label>
          <Select 
            value={form.submission_style} 
            onValueChange={(value: any) => setForm({ ...form, submission_style: value })}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google_link">Google Link</SelectItem>
              <SelectItem value="file_upload">File Upload</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 ">
        <Button variant="outline" type="button" onClick={mode === "edit" ? () => onSetMode("view") : onClose} className="rounded-xl">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createAssignmentMutation.isPending || updateAssignmentMutation.isPending}
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)]"
        >
          {(createAssignmentMutation.isPending || updateAssignmentMutation.isPending) ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {mode === "add" ? "Create Assignment" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
