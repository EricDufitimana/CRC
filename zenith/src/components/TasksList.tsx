import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Plus } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Review Sarah's Essay",
    description: "Computer Science application essay",
    completed: false,
    priority: "high",
    dueDate: "Today"
  },
  {
    id: "2", 
    title: "Schedule parent meeting",
    description: "Discuss Michael's academic performance",
    completed: false,
    priority: "medium",
    dueDate: "Tomorrow"
  },
  {
    id: "3",
    title: "Update GPA records",
    description: "Process end-of-semester grades",
    completed: true,
    priority: "low",
    dueDate: "Completed"
  },
  {
    id: "4",
    title: "Prepare workshop materials",
    description: "College application workshop next week",
    completed: false,
    priority: "medium",
    dueDate: "Friday"
  }
];

function SortableTask({ task, onToggle }: { task: Task; onToggle: (id: string) => void; }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive";
      case "medium": return "bg-primary/10 text-primary";
      case "low": return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        p-3 bg-card border border-border rounded-lg transition-all duration-200
        ${isDragging ? "opacity-50 scale-95" : "hover:shadow-sm"}
        ${task.completed ? "opacity-60" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="mt-1 data-[state=checked]:bg-success data-[state=checked]:border-success"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium text-sm ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {task.title}
            </h4>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground mb-2">
            {task.description}
          </p>
          
          {task.dueDate && (
            <div className="text-xs text-primary font-medium">
              {task.dueDate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TasksList() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTasks((tasks) => {
        const oldIndex = tasks.findIndex((task) => task.id === active.id);
        const newIndex = tasks.findIndex((task) => task.id === over.id);

        return arrayMove(tasks, oldIndex, newIndex);
      });
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Tasks</CardTitle>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {tasks.length} completed
            </p>
          </div>
          <Button size="sm" className="bg-success hover:bg-success-dark text-success-foreground">
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {tasks.map((task) => (
                <SortableTask 
                  key={task.id} 
                  task={task} 
                  onToggle={handleToggleTask}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}