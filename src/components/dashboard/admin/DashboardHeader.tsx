interface DashboardHeaderProps {
  adminName: string;
}

export function DashboardHeader({ adminName }: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <div className="text-2xl font-bold font-cal-sans text-gray-900 mb-1">
        Welcome back, <span className="font-cal-sans font-bold">{adminName || 'Admin'}</span> 👋
      </div>
      <p className="text-gray-600 text-sm">
        Here&apos;s what&apos;s happening with your students this week
      </p>
    </div>
  );
}
