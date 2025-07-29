"use client";

import { useUserData } from "@/hooks/useUserData";

export function UserInfo() {
  const { userId, adminId, isLoading, error } = useUserData();

  if (isLoading) {
    return <div>Loading user info...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">User Information</h3>
      <div className="space-y-2 text-sm">
        <p><strong>User ID:</strong> {userId || 'Not available'}</p>
        <p><strong>Admin ID:</strong> {adminId || 'Not available'}</p>
      </div>
    </div>
  );
} 