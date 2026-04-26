"use client";

import { useState, useEffect, useRef } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/zenith/components/ui/button";
import { Label } from "@/zenith/components/ui/label";
import { Badge } from "@/zenith/components/ui/badge";
import { showToastSuccess, showToastError, showToastPromise } from "@/components/toasts";
import { Loader2, Calendar, Upload, Link as LinkIcon, Edit, Trash2 } from "lucide-react";
import { StableGrainient } from "../content-management/StableGrainient";

interface AssignmentDialogProps {
  workshop: { id: string; title: string } | null;
  mode: "view" | "add" | "edit";
  onClose: () => void;
  onSetMode: (mode: "view" | "add" | "edit") => void;
}

interface FormErrors {
  title?: string[];
  description?: string[];
  crc_class_id?: string[];
  workshop_id?: string[];
  submission_deadline?: string[];
}

export function AssignmentDialog({ workshop, mode, onClose, onSetMode }: AssignmentDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const leftColumnRef = useRef<HTMLDivElement | null>(null);
  const [grainientHeight, setGrainientHeight] = useState(420);

  const [form, setForm] = useState({
    crc_class_id: "",
    workshop_id: workshop?.id || "",
    title: "",
    description: "",
    submission_deadline: "",
    submission_style: "google_link" as "google_link" | "file_upload",
  });
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const { data: assignment, isLoading: fetchingAssignment } = useQuery({
    ...trpc.workshopsManagement.getAssignmentByWorkshopId.queryOptions({ workshopId: workshop?.id || "" }),
    enabled: !!workshop?.id && (mode === "view" || mode === "edit")
  });

  const { data: crcClasses, isLoading: fetchingClasses } = useQuery({
    ...trpc.workshopsManagement.getCrcClasses.queryOptions(),
    enabled: mode === "add"
  });

  const gradeGroups = crcClasses?.reduce((acc, crcClass) => {
    const group = crcClass.grade_group;
    if (!group) return acc;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(crcClass);
    return acc;
  }, {} as Record<string, typeof crcClasses>) || {};

  const { data: classWorkshops, isLoading: fetchingClassWorkshops } = useQuery({
    ...trpc.workshopsManagement.getWorkshopsByCategory.queryOptions({ 
      category: form.crc_class_id.startsWith('grade:') 
        ? form.crc_class_id.replace('grade:', '') 
        : `class:${form.crc_class_id}` 
    }),
    enabled: mode === "add" && !!form.crc_class_id
  });

  useEffect(() => {
    if (assignment && mode === "edit") {
      setForm({
        crc_class_id: "",
        workshop_id: workshop?.id || "",
        title: assignment.title,
        description: assignment.description,
        submission_deadline: new Date(assignment.submission_deadline).toISOString().slice(0, 16),
        submission_style: assignment.submission_style as any,
      });
      setCurrentStep(1);
    } else if (mode === "add") {
       setForm({
        crc_class_id: "",
        workshop_id: workshop?.id || "",
        title: "",
        description: "",
        submission_deadline: "",
        submission_style: "google_link",
      });
      setCurrentStep(1);
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

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: [] }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!form.title.trim()) errors.title = ["Title is required"];
    if (!form.description.trim()) errors.description = ["Description is required"];
    
    if (mode === "add") {
      if (!form.crc_class_id) errors.crc_class_id = ["Class is required"];
      if (!form.workshop_id) errors.workshop_id = ["Workshop is required"];
    }
    if (!form.submission_deadline) errors.submission_deadline = ["Deadline is required"];
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const errors: FormErrors = {};
      if (!form.title.trim()) errors.title = ["Title is required"];
      if (!form.description.trim()) errors.description = ["Description is required"];
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!validateForm()) return;
    }
    
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentStep < 3) setCurrentStep(currentStep + 1);
      else handleSubmit();
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentStep > 1) setCurrentStep(currentStep - 1);
      setIsTransitioning(false);
    }, 300);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      setCurrentStep(2);
      return;
    }

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

  useEffect(() => {
    const el = leftColumnRef.current;
    if (!el || mode === "view") return;

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const next = clamp(Math.ceil(entry.contentRect.height), 360, 640);
      setGrainientHeight((prev) => (prev === next ? prev : next));
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);

  if (fetchingAssignment && (mode === "view" || mode === "edit")) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600 mb-2" />
        <p className="text-gray-500">Loading assignment details...</p>
      </div>
    );
  }

  if (fetchingClasses && mode === "add") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600 mb-2" />
        <p className="text-gray-500">Loading classes...</p>
      </div>
    );
  }

  // --- VIEW MODE ---
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
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
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

  // --- ADD / EDIT MODE ---
  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="w-[154px] h-[5px] flex gap-0.5 items-center">
        <div className={`h-[5px] rounded-[27px] transition-all duration-500 ease-out ${
          currentStep === 1 ? 'w-[43px] bg-[#222]' : 
          'w-[30px] bg-[rgba(212,212,212,0.5)]'
        }`} />
        <div className={`h-[5px] rounded-[27px] transition-all duration-500 ease-out ${
          currentStep === 2 ? 'w-[43px] bg-[#222]' : 
          'w-[30px] bg-[rgba(212,212,212,0.5)]'
        }`} />
        <div className={`h-[5px] rounded-[27px] transition-all duration-500 ease-out ${
          currentStep === 3 ? 'w-[43px] bg-[#222]' : 
          'w-[30px] bg-[rgba(212,212,212,0.5)]'
        }`} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex gap-6 pt-7 items-stretch"
      >
        {/* Left Column */}
        <div ref={leftColumnRef} className="flex-1 flex flex-col min-h-0">
          
          <div className={`mb-7 transition-all duration-300 ${isTransitioning ? 'opacity-0 transform -translate-x-2' : 'opacity-100 transform translate-x-0'}`}>
            <h2 className="text-[17px] font-bold text-[rgb(34,34,34)] leading-snug mb-2">
              {currentStep === 1 && (mode === "add" ? "Create assignment" : "Edit assignment")}
              {currentStep === 2 && "Assignment format"}
              {currentStep === 3 && "Review & submit"}
            </h2>
            <p className="text-[13px] font-light text-[rgba(96,115,142,0.88)] leading-relaxed">
              {currentStep === 1 && "Start with the main assignment details"}
              {currentStep === 2 && "Choose how and when students should submit"}
              {currentStep === 3 && "Review your information before submitting"}
            </p>
          </div>

          <div className={`flex-1 flex flex-col gap-5 transition-all duration-300 ${isTransitioning ? 'opacity-0 transform -translate-x-2' : 'opacity-100 transform translate-x-0'}`}>
            
            {/* Step 1 */}
            {currentStep === 1 && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                    Assignment Title*
                  </label>
                  <input
                    type="text"
                    placeholder="Assignment title"
                    value={form.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors ${
                      fieldErrors.title && fieldErrors.title.length > 0 ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
                    }`}
                  />
                  {fieldErrors.title && fieldErrors.title.length > 0 && (
                    <span className="text-red-500 text-xs mt-1">{fieldErrors.title[0]}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                    Description*
                  </label>
                  <textarea
                    placeholder="Detailed instructions for students..."
                    value={form.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full min-h-[120px] px-3.5 py-3 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none resize-y focus:border-[rgba(136,136,136,0.4)] transition-colors ${
                      fieldErrors.description && fieldErrors.description.length > 0 ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
                    }`}
                  />
                  {fieldErrors.description && fieldErrors.description.length > 0 && (
                    <span className="text-red-500 text-xs mt-1">{fieldErrors.description[0]}</span>
                  )}
                </div>
              </>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <>
                {mode === "add" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                        Class / Group*
                      </label>
                      <select
                        value={form.crc_class_id}
                        onChange={(e) => {
                          setForm(prev => ({ ...prev, crc_class_id: e.target.value, workshop_id: "" }));
                          setFieldErrors(prev => ({ ...prev, crc_class_id: [] }));
                        }}
                        disabled={fetchingClasses}
                        className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors ${
                          fieldErrors.crc_class_id && fieldErrors.crc_class_id.length > 0 ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
                        }`}
                      >
                        <option value="" disabled>Select a class or group</option>
                        {gradeGroups['Enrichment_Year'] && <option value="grade:ey">Enrichment Year (All Classes)</option>}
                        {gradeGroups['Senior_4'] && <option value="grade:senior_4">Senior 4 (All Classes)</option>}
                        {Object.entries(gradeGroups).map(([gradeGroup, classes]) => (
                          <optgroup key={gradeGroup} label={gradeGroup.replace('_', ' ')}>
                            {classes.map((crcClass) => (
                              <option key={crcClass.id} value={crcClass.id}>
                                {crcClass.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      {fieldErrors.crc_class_id && fieldErrors.crc_class_id.length > 0 && (
                        <span className="text-red-500 text-xs mt-1">{fieldErrors.crc_class_id[0]}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                        Workshop*
                      </label>
                      <select
                        value={form.workshop_id}
                        onChange={(e) => handleInputChange('workshop_id', e.target.value)}
                        disabled={!form.crc_class_id || fetchingClassWorkshops}
                        className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors ${
                          fieldErrors.workshop_id && fieldErrors.workshop_id.length > 0 ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
                        }`}
                      >
                        <option value="" disabled>{form.crc_class_id ? "Select a workshop" : "Select a class first"}</option>
                        {classWorkshops && classWorkshops.map((work: any) => (
                          <option key={work.id} value={work.id}>
                            {work.title}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.workshop_id && fieldErrors.workshop_id.length > 0 && (
                        <span className="text-red-500 text-xs mt-1">{fieldErrors.workshop_id[0]}</span>
                      )}
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                    Submission Deadline*
                  </label>
                  <input
                    type="datetime-local"
                    value={form.submission_deadline}
                    onChange={(e) => handleInputChange('submission_deadline', e.target.value)}
                    className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors ${
                      fieldErrors.submission_deadline && fieldErrors.submission_deadline.length > 0 ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
                    }`}
                  />
                  {fieldErrors.submission_deadline && fieldErrors.submission_deadline.length > 0 && (
                    <span className="text-red-500 text-xs mt-1">{fieldErrors.submission_deadline[0]}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                    Submission Style
                  </label>
                  <select
                    value={form.submission_style}
                    onChange={(e) => handleInputChange('submission_style', e.target.value)}
                    className="w-full h-10 px-3.5 rounded-[10px] border border-[rgba(136,136,136,0.2)] bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors"
                  >
                    <option value="google_link">Google Link</option>
                    <option value="file_upload">File Upload</option>
                  </select>
                </div>
              </>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-[11px] font-semibold text-gray-400">
                        Assignment Summary
                      </span>
                    </div>
                  </div>

                  {[
                    { label: "Title", value: form.title },
                    { label: "Deadline", value: form.submission_deadline.replace('T', ' ') },
                    { label: "Format", value: form.submission_style.replace('_', ' ') },
                  ].map(({ label, value }, i, arr) => (
                    <div
                      key={label}
                      className={`flex items-baseline gap-4 px-4 py-2.5 ${
                        i < arr.length - 1 ? "border-b border-gray-50" : ""
                      }`}
                    >
                      <span className="text-[11px] font-semibold text-gray-400 w-24 shrink-0">
                        {label}
                      </span>
                      <span className="text-xs text-gray-800 break-all capitalize">{value}</span>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/80 border-t border-gray-100">
                    <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Review the details above. Click <span className="font-medium text-gray-500">Submit</span> to save.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`flex gap-3 mt-4 pt-4 border-t border-[rgba(34,34,34,0.06)] transition-all duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
            <button
              type="button"
              onClick={currentStep > 1 ? handlePrevious : (mode === "edit" ? () => onSetMode("view") : onClose)}
              disabled={isTransitioning}
              className="flex-1 h-10 rounded-[10px] border border-[rgba(34,34,34,0.15)] bg-white text-[13px] font-semibold text-[rgb(34,34,34)] cursor-pointer transition-all duration-150 hover:bg-[rgba(34,34,34,0.04)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep > 1 ? "Back" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isTransitioning || (mode === "add" ? createAssignmentMutation.isPending : updateAssignmentMutation.isPending)}
              className="flex-1 h-10 rounded-[10px] bg-[rgb(34,34,34)] text-[13px] font-semibold text-white cursor-pointer transition-all duration-150 hover:bg-[rgb(51,51,51)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(createAssignmentMutation.isPending || updateAssignmentMutation.isPending) ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                currentStep === 3 ? "Submit" : "Next"
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Grainient */}
        <div
          className="w-2/5 rounded-[28px] overflow-hidden relative border border-slate-300"
          style={{ height: grainientHeight }}
        >
          <StableGrainient color1="#1F6F5F" color2="#6FCF97" color3="#2FA084" />
        </div>
      </form>
    </div>
  );
}
