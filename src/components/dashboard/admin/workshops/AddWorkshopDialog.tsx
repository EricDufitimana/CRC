"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Label } from "@/zenith/components/ui/label";
import { Textarea } from "@/zenith/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/zenith/components/ui/select";
import { showToastSuccess, showToastError, showToastPromise } from "@/components/toasts";
import { Loader2 } from "lucide-react";

interface AddWorkshopDialogProps {
  onClose: () => void;
}

export function AddWorkshopDialog({ onClose }: AddWorkshopDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    description: "",
    presentation_url: "",
    google_slide_url: "",
    workshop_date: "",
    workshop_group: "",
  });

  const { data: crcClasses = [], isLoading: crcClassesLoading } = useQuery(
    trpc.workshopsManagement.getCrcClasses.queryOptions()
  );

  const createWorkshopMutation = useMutation({
    ...trpc.workshopsManagement.createWorkshop.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['workshopsManagement', 'getWorkshopsByCategory']] });
      showToastSuccess({
        headerText: 'Workshop Created',
        paragraphText: 'The workshop has been added successfully',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const promise = createWorkshopMutation.mutateAsync(form);
    showToastPromise({
      promise,
      loadingText: 'Creating workshop...',
      successText: 'Workshop created successfully',
      successHeaderText: 'Success',
      errorText: 'Failed to create workshop',
      errorHeaderText: 'Error',
      direction: 'right'
    });
  };

  const gradeGroups = [
    { value: "Enrichment_Year", label: "Enrichment Year" },
    { value: "Senior_4", label: "Senior 4" },
    { value: "Senior_5", label: "Senior 5" },
    { value: "Senior_6", label: "Senior 6" },
  ];

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Workshop title"
            required
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>CRC Class / Group</Label>
          <Select
            value={form.workshop_group}
            onValueChange={(value) => setForm({ ...form, workshop_group: value })}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select a class or group" />
            </SelectTrigger>
            <SelectContent>
              {gradeGroups.map((group) => (
                <div key={group.value}>
                  <SelectItem value={group.value} className="font-semibold">{group.label} (All)</SelectItem>
                  {crcClasses
                    .filter(c => c.grade_group === group.value)
                    .map(c => (
                      <SelectItem key={c.id} value={`class:${c.id}`} className="pl-6">
                        {c.name}
                      </SelectItem>
                    ))
                  }
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Workshop description..."
          required
          rows={3}
          className="rounded-xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Workshop Date</Label>
          <Input
            type="date"
            value={form.workshop_date}
            onChange={(e) => setForm({ ...form, workshop_date: e.target.value })}
            required
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Google Slides Link (Optional)</Label>
          <Input
            type="url"
            value={form.google_slide_url}
            onChange={(e) => setForm({ ...form, google_slide_url: e.target.value })}
            placeholder="https://docs.google.com/presentation/..."
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createWorkshopMutation.isPending}
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)]"
        >
          {createWorkshopMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Create Workshop
        </Button>
      </div>
    </form>
  );
}
