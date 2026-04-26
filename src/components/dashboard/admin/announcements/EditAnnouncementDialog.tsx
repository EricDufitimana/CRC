"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/zenith/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/zenith/components/ui/form";
import { Input } from "@/zenith/components/ui/input";
import { Button } from "@/zenith/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/zenith/components/ui/select";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToastSuccess, showToastError } from "@/components/toasts";
import { Loader2 } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "@/zenith/components/ui/command";
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const availablePages = [
  "home",
  "new_opportunities", 
  "recurring_opportunities",
  "templates",
  "crp",
  "internships",
  "english_language_learning",
  "approved_opportunities",
  "previous_events",
  "upcoming_events",
  "s4_workshops",
  "ey_workshops",
  "senior_5_group_a_b_workshops",
  "senior_5_customer_care",
  "senior_6_group_a_b_workshops",
  "senior_6_group_c_workshops",
  "senior_6_group_d",
  "job_readiness_course",
  "student_dashboard",
  "admin_dashboard"
];

const formatPageLabel = (page: string) => {
  return page.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const formSchema = z.object({
  id: z.string(),
  message: z.string().min(1, "Message is required"),
  page: z.string().min(1, "Target page is required"),
  end_time: z.string().optional().nullable(),
});

interface EditAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: any;
}

export function EditAnnouncementDialog({ open, onOpenChange, announcement }: EditAnnouncementDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      message: "",
      page: "",
      end_time: "",
    },
  });

  useEffect(() => {
    if (announcement) {
      form.reset({
        id: announcement.id,
        message: announcement.message,
        page: announcement.page,
        end_time: announcement.end_time ? new Date(announcement.end_time).toISOString().slice(0, 16) : "",
      });
    }
  }, [announcement, form]);

  const mutation = useMutation({
    ...trpc.announcementsManagement.updateAnnouncement.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["announcementsManagement", "getAnnouncements"]] });
      showToastSuccess({
        headerText: "Announcement Updated",
        paragraphText: "Changes have been saved successfully.",
        direction: "right"
      });
      onOpenChange(false);
    },
    onError: (error) => {
      showToastError({
        headerText: "Update Failed",
        paragraphText: error.message,
        direction: "right"
      });
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate({
      ...values,
      end_time: values.end_time || null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-[40px] sm:rounded-[40px] p-8 overflow-hidden border-none shadow-2xl bg-white">
        <div className="flex gap-8 items-stretch">
          {/* Left Column */}
          <div className="flex-1 flex flex-col min-h-0">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-gray-900 font-cal-sans">Edit Announcement</DialogTitle>
              <DialogDescription className="text-gray-500 mt-1 text-[15px]">
                Update the content or targeting of your existing announcement.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Message</FormLabel>
                      <div data-color-mode="light" className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <MDEditor
                          value={field.value}
                          onChange={field.onChange}
                          preview="live"
                          height={180}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="page"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target Page</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50 focus:ring-0 h-11 text-[14px]">
                              <SelectValue placeholder="Select a page" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                            <Command className="max-h-[300px]">
                              <CommandInput placeholder="Search pages..." className="h-9" />
                              <CommandList>
                                <CommandEmpty>No page found.</CommandEmpty>
                                <CommandGroup>
                                  {availablePages.map(page => (
                                    <SelectItem key={page} value={page} className="rounded-lg cursor-pointer">
                                      {formatPageLabel(page)}
                                    </SelectItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Expires At (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="rounded-xl border-gray-100 bg-gray-50/50 focus:ring-0 h-11 text-[14px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1 h-11 rounded-xl font-semibold text-gray-500 border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-[2] h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-100 transition-all"
                  >
                    {mutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Right Column - Grainient */}
          <div className="hidden md:block w-1/3 rounded-[32px] overflow-hidden relative border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 mix-blend-overlay z-10" />
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] z-20" />
            <div className="w-full h-full transform scale-110">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 animate-pulse-slow" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
