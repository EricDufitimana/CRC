"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NoClassStateProps {
  onOpenContact: () => void;
}

export function NoClassState({ onOpenContact }: NoClassStateProps) {
  return (
    <div className="h-[40vh] w-full flex flex-col items-center justify-center py-8 text-center">
      <div className="relative w-64 h-64 mb-6">
        <Image
          src="/images/dashboard/empty-assignments.png"
          alt="No CRC class assigned"
          fill
          className="opacity-60 object-contain"
        />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">No CRC Class Assigned</h3>
      <p className="text-neutral-500 mb-4 max-w-md">
        You haven&apos;t been assigned to a CRC class yet. Please contact your administrator to get assigned to a class and access your assignments.
      </p>
      <div className="flex gap-3">
        <Link href="/dashboard/student">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
        <Button onClick={onOpenContact} variant="default" className="bg-dark hover:bg-dark/90 text-white">
          Contact Support
        </Button>
      </div>
    </div>
  );
}
