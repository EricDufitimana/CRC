import { Skeleton } from "../../../../zenith/src/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../zenith/src/components/ui/table";

export function AssignmentDetailLoading() {
  return (
    <>
      {/* Top metrics skeleton */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-8 w-48 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border p-3 bg-white">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="space-y-3">
        <div className="pb-2">
          <Skeleton className="h-6 w-48" />
        </div>
        {/* Filters skeleton */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="rounded-lg border overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Submission Status</TableHead>
                <TableHead>Assignment Submit Date</TableHead>
                <TableHead>Submission Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

