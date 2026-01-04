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
      <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl font-bold font-cal-sans">Edit Announcement</DialogTitle>
            <DialogDescription className="text-blue-50/80">
              Update the content or targeting of your existing announcement.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Message</FormLabel>
                  <div data-color-mode="light" className="rounded-xl overflow-hidden border border-gray-200">
                    <MDEditor
                      value={field.value}
                      onChange={field.onChange}
                      preview="live"
                      height={200}
                    />
                  </div>
                  <FormDescription>Supports Markdown formatting.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="page"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Target Page</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-gray-200 focus:ring-0 focus:border-blue-500 h-11">
                          <SelectValue placeholder="Select a page" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {availablePages.map(page => (
                          <SelectItem key={page} value={page} className="rounded-lg">
                            {formatPageLabel(page)}
                          </SelectItem>
                        ))}
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
                    <FormLabel className="text-gray-700 font-semibold">Expires At (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="rounded-xl border-gray-200 focus:ring-0 focus:border-blue-500 h-11"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Leave empty for indefinite duration.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4 mt-6 border-t border-gray-100 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-xl font-medium text-gray-500"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-semibold shadow-lg shadow-blue-100 focus:ring-0"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
