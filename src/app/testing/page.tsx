import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Icon } from "@radix-ui/react-select";
import { CheckCircle } from "lucide-react";

export default function TestingPage(){
  return (
    <div className="grid grid-cols-1 p-4 md:grid-cols-3 gap-6 ">
      <div className="bg-slate-200 max-w-xs rounded-lg">
        <div className="bg-white mt-4 rounded-lg border border-gray-200">
          <h1 className="text-2xl font-bold">Title</h1>
        </div>
      </div> 
    
    </div>
  )
}