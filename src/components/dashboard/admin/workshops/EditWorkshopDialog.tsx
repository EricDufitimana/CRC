"use client";

import { useState, useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Label } from "@/zenith/components/ui/label";
import { Textarea } from "@/zenith/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/zenith/components/ui/select";
import { showToastSuccess, showToastError, showToastPromise } from "@/components/toasts";
import { Loader2 } from "lucide-react";

type SupabaseWorkshop = {
  id: string;
  title: string;
  description: string;
  presentation_url?: string;
  google_slide_url?: string;
  date: string;
  crc_classes?: { id: string; name: string }[];
};

interface EditWorkshopDialogProps {
  workshop: SupabaseWorkshop;
  onClose: () => void;
}

export function EditWorkshopDialog({ workshop, onClose }: EditWorkshopDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    id: workshop.id,
    title: workshop.title,
    description: workshop.description,
    presentation_url: workshop.presentation_url || "",
    google_slide_url: workshop.google_slide_url || "",
    workshop_date: workshop.date ? new Date(workshop.date).toISOString().split('T')[0] : "",
    workshop_group: workshop.crc_classes && workshop.crc_classes.length > 0 ? `class:${workshop.crc_classes[0].id}` : "",
  });

  const { data: crcClasses = [] } = useQuery(
    trpc.workshopsManagement.getCrcClasses.queryOptions()
  );

  const updateWorkshopMutation = useMutation({
    ...trpc.workshopsManagement.updateWorkshop.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['workshopsManagement', 'getWorkshopsByCategory']] });
      showToastSuccess({
        headerText: 'Workshop Updated',
        paragraphText: 'The workshop has been updated successfully',
        direction: 'right'
      });
      onClose();
    },
    onError: (error) => {
      showToastError({
        headerText: 'Update Failed',
        paragraphText: error.message,
        direction: 'right'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const promise = updateWorkshopMutation.mutateAsync(form);
    showToastPromise({
      promise,
      loadingText: 'Updating workshop...',
      successText: 'Workshop updated successfully',
      successHeaderText: 'Success',
      errorText: 'Failed to update workshop',
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
          disabled={updateWorkshopMutation.isPending}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)]"
        >
          {updateWorkshopMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Update Workshop
        </Button>
      </div>
    </form>
  );
}
