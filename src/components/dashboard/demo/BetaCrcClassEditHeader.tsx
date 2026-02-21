"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { ArrowLeft, Edit, Check, X } from "lucide-react";
import { showToastError } from "@/components/toasts";

interface CrcClassEditHeaderProps {
  group: {
    id: string;
    name: string;
    created_by_name: string;
    grade_group: string | null;
  };
}

export function BetaCrcClassEditHeader({ group }: CrcClassEditHeaderProps) {
  const router = useRouter();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");

  const startEditingName = () => {
    setEditingName(group.name);
    setIsEditingName(true);
  };

  const saveClassName = () => {
    showToastError({
      headerText: "Demo Action",
      paragraphText: "Editing class name is disabled in the demo dashboard.",
      direction: "right"
    });
    setIsEditingName(false);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setEditingName("");
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => router.push('/demo/admin/crc-class-groups')}
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
              className="h-8 text-white"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={cancelEditingName}
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
