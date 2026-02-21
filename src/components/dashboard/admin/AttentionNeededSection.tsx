"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  WarningCircle, 
  CheckCircle, 
  ArrowRight
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

interface AttentionItem {
  id?: string;
  title: string;
  type: 'workshop' | 'essay' | 'opportunity' | 'assignment';
  description: string;
  missingClasses?: string[];
  workshop?: any;
  assignment?: any;
}

interface AttentionNeededSectionProps {
  items: AttentionItem[];
  loading: boolean;
  basePath?: string;
}

export function AttentionNeededSection({ items, loading, basePath = "/dashboard/admin" }: AttentionNeededSectionProps) {
  const router = useRouter();

  const handleAssignmentClick = (assignment: any) => {
    const params = new URLSearchParams();
    params.set('assignmentId', assignment.id);
    
    if (assignment.workshop_title) {
      params.set('workshopId', assignment.workshop_title);
    }
    
    if (assignment.crc_class_name) {
      params.set('crcClassId', assignment.crc_class_name);
      if (assignment.crc_class_id) {
        params.set('subClassId', assignment.crc_class_id);
      }
    }
    
    router.push(`${basePath}/assignments-management?${params.toString()}`);
  };

  return (
    <Card className="shadow-none border hover:shadow-sm transition-all duration-200 h-[55vh] rounded-2xl ">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <WarningCircle weight="fill" className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-md font-semibold text-gray-900">Attention Needed</CardTitle>
              <p className="text-xs text-gray-500">Items requiring action</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">{items.length}</div>
            <div className="text-xs text-gray-500">items</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(50vh-80px)] pt-2">
        <ScrollArea className="h-full">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group relative p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-red-200 rounded mr-3 flex-shrink-0 animate-pulse"></div>
                    <div className="h-4 w-32 bg-red-200 rounded animate-pulse"></div>
                  </div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-3 pr-4">
              {items.map((item, index) => (
                <div 
                  key={item.id || index} 
                  className={`group relative p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200 ${
                    item.type === 'assignment' ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => item.type === 'assignment' && item.assignment && handleAssignmentClick(item.assignment)}
                  onKeyDown={(e) => {
                    if (item.type === 'assignment' && item.assignment && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleAssignmentClick(item.assignment);
                    }
                  }}
                  tabIndex={item.type === 'assignment' ? 0 : -1}
                  role={item.type === 'assignment' ? 'button' : undefined}
                  aria-label={item.type === 'assignment' ? `View assignment: ${item.title}` : undefined}
                >
                  <div className="flex items-start">
                    <WarningCircle weight="fill" className="h-4 w-4 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm text-red-800 font-medium">{item.title}</span>
                      <div className="text-xs text-red-600 mt-1">{item.description}</div>
                      {item.missingClasses && item.missingClasses.length > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          Missing attendance for: {item.missingClasses.join(', ')}
                        </div>
                      )}
                    </div>
                    {item.type === 'assignment' && (
                      <div className="ml-2 flex-shrink-0">
                        <ArrowRight weight="fill" className="h-3 w-3 text-red-500 group-hover:text-red-600 transition-colors" />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="relative">
                <CheckCircle weight="fill" className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <div className="absolute inset-0 bg-green-100 rounded-full opacity-20 animate-pulse"></div>
              </div>
              <p className="text-lg font-medium text-gray-600 mb-2">All caught up!</p>
              <p className="text-sm text-gray-400">No items require attention</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

