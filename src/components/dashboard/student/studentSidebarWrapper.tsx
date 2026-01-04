"use client";
import { Suspense, Component, ReactNode } from "react";
import StudentSidebar from "./StudentSidebar";
import { Skeleton } from "@/components/ui/ContentSkeleton";
import { AlertCircle, LayoutDashboard, ClipboardList, Briefcase, Folder, Home, LogOut } from "lucide-react";
import Link from "next/link";

// Minimal loading fallback - just avatar and name
function SidebarSkeleton() {
  return (
    <aside className="hidden shrink-0 lg:block w-72 m-0.5">
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 h-full overflow-auto flex flex-col justify-center items-center">
        {/* Loading state for profile section only */}
        <div className="p-6">
          <div className="mt-4 h-short:mt-1 flex flex-col items-center gap-3">
            <Skeleton className="h-40 w-40 h-short:h-30 h-short:w-30 rounded-full" />
            <div className="text-center">
              <Skeleton className="h-5 w-40 mx-auto mb-2" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
        </div>

        {/* Static navigation - no loading needed */}
        <nav className="p-3 pt-8">
          <ul className="flex flex-col space-y-4">
            <li>
              <div className="flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base text-neutral-600">
                <LayoutDashboard className="h-5 w-5 text-neutral-500" />
                Dashboard
              </div>
            </li>
            <li>
              <div className="flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base text-neutral-600">
                <ClipboardList className="h-5 w-5 text-neutral-500" />
                Assignments
              </div>
            </li>
            <li>
              <div className="flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base text-neutral-600">
                <Briefcase className="h-5 w-5 text-neutral-500" />
                Requests
              </div>
            </li>
            <li>
              <div className="flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base text-neutral-600">
                <Folder className="h-5 w-5 text-neutral-500" />
                Documents
              </div>
            </li>
          </ul>
        </nav>

        {/* Static footer - no loading needed */}
        <div className="p-3 mt-auto">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-base text-neutral-600">
              <Home className="h-5 w-5" />
              Home
            </div>
            <span className="text-neutral-400">|</span>
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-base text-neutral-600">
              <LogOut className="h-5 w-5" />
              Sign out
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Error fallback - minimal
function SidebarError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <aside className="hidden shrink-0 lg:block w-72 m-0.5">
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 h-full overflow-auto flex flex-col justify-center items-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Profile
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {error.message || "An error occurred"}
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}


// Error Boundary Class Component
interface SidebarErrorBoundaryProps {
  children: ReactNode;
}

interface SidebarErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class SidebarErrorBoundary extends Component<
  SidebarErrorBoundaryProps,
  SidebarErrorBoundaryState
> {
  constructor(props: SidebarErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any): void {
    console.error("Sidebar Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SidebarError
          error={this.state.error!}
          reset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}



// Main wrapper component
export default function StudentSidebarWrapper() {
  return (
    <SidebarErrorBoundary>
      <Suspense fallback={<SidebarSkeleton />}>
        <StudentSidebar />
      </Suspense>
    </SidebarErrorBoundary>
  );
}