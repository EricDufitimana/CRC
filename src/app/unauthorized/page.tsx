"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldX className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-600">Access Denied</CardTitle>
          <CardDescription className="text-lg">
            You are not authorized to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            This page is restricted to authorized administrators only.
          </p>
          <Button
            onClick={() => router.back()}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
