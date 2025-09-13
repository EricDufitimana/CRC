import { useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Edit, Trash2, Upload, FileText, Briefcase, Calendar, GraduationCap, Building, Users, BookOpen } from "lucide-react";
const categories = [{
  id: "resumes",
  label: "Resume Templates",
  icon: FileText
}, {
  id: "internships",
  label: "Internships",
  icon: Briefcase
}, {
  id: "events",
  label: "Events",
  icon: Calendar
}, {
  id: "workshops",
  label: "Workshops",
  icon: GraduationCap
}, {
  id: "companies",
  label: "Company Profiles",
  icon: Building
}, {
  id: "networking",
  label: "Networking",
  icon: Users
}, {
  id: "resources",
  label: "General Resources",
  icon: BookOpen
}];

export default function ContentManagement() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("resumes");
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  return <div className="min-h-screen bg-background flex w-full">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} isDarkTheme={isDarkTheme} />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader isDarkTheme={isDarkTheme} onThemeToggle={() => setIsDarkTheme(!isDarkTheme)} />
        
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full bg-gray-50">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Content Management</h1>
            <p className="text-muted-foreground">Add/edit resources across all student-facing pages</p>
          </div>

          {/* Two-Column Grid */}
          <div className="grid grid-cols-5 gap-6">
            {/* Left Sidebar - Category Selector (20% width) */}
            <div className="col-span-1 p-4 border border-border rounded-lg bg-card">
              <h3 className="text-sm font-medium text-foreground mb-4">Categories</h3>
              <Tabs orientation="vertical" value={selectedCategory} onValueChange={setSelectedCategory} className="gap-1">
                <TabsList className="h-auto p-0 bg-transparent flex-col">
                  {categories.map(category => {
                  const Icon = category.icon;
                  return <TabsTrigger key={category.id} value={category.id} className="w-full justify-start text-left hover:bg-muted data-[state=active]:bg-muted data-[state=active]:text-foreground">
                        <Icon className="h-4 w-4 mr-2" />
                        {category.label}
                      </TabsTrigger>;
                })}
                </TabsList>
              </Tabs>
            </div>

            {/* Main Content - Resource Editor (80% width) */}
            <div className="col-span-4 space-y-6">
              {/* Resource Table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Resources</CardTitle>
                  <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="text-white border-white bg-green-500 hover:bg-green-600 ">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Resource
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Resource</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input placeholder="Interview Tips 2024" />
                        <Input type="file" accept="image/*" />
                        <Textarea placeholder="Resource description..." />
                        <Input placeholder="https://example.com/resource" />
                        <Input type="date" placeholder="Expiry date (optional)" />
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsAddResourceOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={() => setIsAddResourceOpen(false)}>
                            Add Resource
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Preview</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead className="w-[50px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resources.map(resource => <TableRow key={resource.id}>
                          <TableCell>
                            <Avatar>
                              <AvatarImage src={resource.image} />
                              <AvatarFallback>{resource.title.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">
                            <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">
                              {resource.title}
                            </a>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {resource.description.length > 50 ? `${resource.description.substring(0, 50)}...` : resource.description}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {resource.opportunity_deadline || "No expiry"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Video Upload Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Tips & Guidance Videos</CardTitle>
                  </div>
                  <Dialog open={isAddVideoOpen} onOpenChange={setIsAddVideoOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="text-white border-white \\\\n bg-orange-500 hover:bg-orange-600 ">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Video
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload New Video</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input placeholder="Video title..." />
                        <Input type="file" accept="video/*" />
                        <Textarea placeholder="Video description..." />
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsAddVideoOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={() => setIsAddVideoOpen(false)}>
                            Upload Video
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map(video => <Card key={video.id} className="overflow-hidden">
                        <div className="aspect-video bg-muted relative">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            {video.duration}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-medium text-foreground">{video.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {new Date(video.uploadDate).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>;
}