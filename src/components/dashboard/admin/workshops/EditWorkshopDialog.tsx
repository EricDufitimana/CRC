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
import { Loader2, Check, ChevronsUpDown, X as CloseIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/zenith/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/zenith/components/ui/command";
import { Badge } from "@/zenith/components/ui/badge";
import { cn } from "@/zenith/lib/utils";

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
    workshop_groups: workshop.crc_classes ? workshop.crc_classes.map(c => `class:${c.id}`) : [] as string[],
  });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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

  const toggleGroup = (value: string) => {
    const group = gradeGroups.find(g => g.value === value);
    
    setForm(prev => {
      let nextGroups = [...prev.workshop_groups];
      
      if (group) {
        // It's a grade group (All)
        const subClasses = crcClasses
          .filter((c: any) => c.grade_group === value)
          .map((c: any) => `class:${c.id}`);
        
        const allSubSelected = subClasses.every(id => nextGroups.includes(id));
        
        if (allSubSelected) {
          nextGroups = nextGroups.filter(id => !subClasses.includes(id));
        } else {
          nextGroups = Array.from(new Set([...nextGroups, ...subClasses]));
        }
      } else {
        // Individual class
        if (nextGroups.includes(value)) {
          nextGroups = nextGroups.filter(v => v !== value);
        } else {
          nextGroups.push(value);
        }
      }
      
      return { ...prev, workshop_groups: nextGroups };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.workshop_groups.length === 0) {
      showToastError({
        headerText: 'Validation Error',
        paragraphText: 'Please select at least one class or group.',
        direction: 'right'
      });
      return;
    }
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
          <Label>CRC Classes / Groups</Label>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                role="combobox"
                aria-expanded={isPopoverOpen}
                className={cn(
                  "w-full min-h-10 px-3.5 py-2 rounded-xl border bg-background text-[14px] text-gray-800 outline-none flex items-center justify-between transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                  "border-input shadow-sm"
                )}
              >
                <div className="flex flex-wrap gap-1.5 items-center">
                  {form.workshop_groups.length === 0 ? (
                    <span className="text-muted-foreground font-light">Select classes or groups</span>
                  ) : (
                    form.workshop_groups.map((val) => {
                      const group = gradeGroups.find(g => g.value === val);
                      const cls = crcClasses.find((c: any) => `class:${c.id}` === val);
                      const label = group ? `${group.label} (All)` : cls?.name || val;
                      return (
                        <Badge
                          key={val}
                          variant="secondary"
                          className="bg-white/80 backdrop-blur-sm border-gray-100 text-[11px] font-medium text-gray-700 h-6 px-2 rounded-lg flex items-center gap-1 group/badge"
                        >
                          {label}
                          <CloseIcon
                            size={12}
                            className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGroup(val);
                            }}
                          />
                        </Badge>
                      );
                    })
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0 rounded-2xl border border-gray-100 shadow-2xl bg-white/95 backdrop-blur-md overflow-hidden" align="start">
              <Command className="bg-transparent h-full">
                <CommandInput placeholder="Search classes..." className="h-11 border-none focus:ring-0 text-[13px]" />
                <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden py-1">
                  <CommandEmpty className="py-6 text-center text-sm text-gray-400">No classes found.</CommandEmpty>
                  {gradeGroups.map((group) => (
                    <CommandGroup key={group.value} heading={group.label} className="px-2">
                      <CommandItem
                        onSelect={() => toggleGroup(group.value)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        {(() => {
                          const subClasses = crcClasses
                            .filter((c: any) => c.grade_group === group.value)
                            .map((c: any) => `class:${c.id}`);
                          const allSubSelected = subClasses.length > 0 && subClasses.every(id => form.workshop_groups.includes(id));
                          return (
                            <div className={cn(
                              "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                              allSubSelected ? "bg-[#222] border-[#222]" : "border-gray-200"
                            )}>
                              {allSubSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                          );
                        })()}
                        <span className="text-[13px] font-medium text-gray-700">{group.label} (All)</span>
                      </CommandItem>
                      {crcClasses
                        .filter((c: any) => c.grade_group === group.value)
                        .map((c: any) => (
                          <CommandItem
                            key={c.id}
                            onSelect={() => toggleGroup(`class:${c.id}`)}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors ml-4"
                          >
                            <div className={cn(
                              "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                              form.workshop_groups.includes(`class:${c.id}`) ? "bg-[#222] border-[#222]" : "border-gray-200"
                            )}>
                              {form.workshop_groups.includes(`class:${c.id}`) && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span className="text-[13px] text-gray-600">{c.name}</span>
                          </CommandItem>
                        ))
                      }
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
