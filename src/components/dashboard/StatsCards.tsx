import { Card, CardContent, CardHeader, CardTitle } from "../../../zenith/src/components/ui/card";
import { FileText, User, Calendar, CheckCircle } from "lucide-react";
const stats = [
  { title: "Essay Reviews", value: "12", description: "Pending this week", icon: FileText, trend: "+3 from last week", color: "text-foreground" },
  { title: "Active Students", value: "248", description: "Currently enrolled", icon: User, trend: "+12 new this month", color: "text-foreground" },
  { title: "Scheduled Meetings", value: "8", description: "This week", icon: Calendar, trend: "2 completed today", color: "text-foreground" }
];
export function StatsCards() {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
      const Icon = stat.icon;
      return <Card key={index} className="shadow-sm cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-slate-200">
                <Icon className="h-5 w-5 text-foreground bg-transparent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {stat.description}
              </div>
              <div className="flex items-center text-xs text-green-500 ">
                <CheckCircle className="w-3 h-3 mr-1" />
                {stat.trend}
              </div>
            </CardContent>
          </Card>;
    })}
    </div>;
} 