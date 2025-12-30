"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../../zenith/src/components/ui/button";
import { Input } from "../../../../zenith/src/components/ui/input";
import { ArrowLeft, Edit, Check, X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { showToastSuccess, showToastError } from "@/components/toasts";

interface CrcClassEditHeaderProps {
  group: {
    id: string;
    name: string;
    created_by_name: string;
    grade_group: string | null;
  };
}

export function CrcClassEditHeader({ group }: CrcClassEditHeaderProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");

  const updateNameMutation = useMutation({
    ...trpc.crcClassManagement.updateCrcClassName.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['crcClassManagement', 'getCrcClassStudents']] });
      queryClient.invalidateQueries({ queryKey: [['crcClassManagement', 'getCrcClasses']] });
      setIsEditingName(false);
      showToastSuccess({
        headerText: 'Success',
        paragraphText: 'Class name updated successfully',
        direction: 'right'
      });
    },
    onError: (error) => {
      showToastError({
        headerText: 'Error',
        paragraphText: error.message || 'Failed to update class name',
        direction: 'right'
      });
    },
  });

  const startEditingName = () => {
    setEditingName(group.name);
    setIsEditingName(true);
  };

  const saveClassName = () => {
    if (!editingName.trim() || editingName.trim() === group.name) {
      setIsEditingName(false);
      return;
    }

    updateNameMutation.mutate({
      classId: group.id,
      name: editingName.trim(),
    });
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setEditingName("");
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => router.push('/dashboard/admin/crc-class-groups')}
        className="flex items-center gap-2 hover:gap-3 transition-all duration-200 group cursor-pointer text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
        <span className="text-sm">Back to Classes</span>
      </div>
      <div>
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  saveClassName();
                } else if (e.key === 'Escape') {
                  cancelEditingName();
                }
              }}
              className="text-2xl font-bold h-10"
              autoFocus
            />
            <Button
              size="sm"
              onClick={saveClassName}
              disabled={updateNameMutation.isPending}
              className="h-8 text-white"
            >
              {updateNameMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={cancelEditingName}
              disabled={updateNameMutation.isPending}
              className="h-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={startEditingName}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-3 mt-1">
          <p className="text-neutral-600">Created by {group.created_by_name}</p>
          {group.grade_group && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {group.grade_group}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

