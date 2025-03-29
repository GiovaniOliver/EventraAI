'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle,
  Loader2, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Filter,
  CalendarRange
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock task data
interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  eventId?: string;
  eventName?: string;
}

export default function TasksPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');
  const [searchQuery, setSearchQuery] = useState("");
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Fetch tasks (mock)
  useEffect(() => {
    const fetchTasks = async () => {
      // In a real app, fetch from API
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const mockTasks: Task[] = [
        {
          id: "1",
          title: "Finalize venue for Annual Conference",
          description: "Contact venues and confirm final booking with deposit",
          dueDate: "2025-05-15",
          completed: false,
          priority: 'high',
          eventId: "101",
          eventName: "Annual Tech Conference"
        },
        {
          id: "2",
          title: "Send speaker invitations",
          description: "Email potential speakers with event details and speaking opportunities",
          dueDate: "2025-04-20",
          completed: true,
          priority: 'medium',
          eventId: "101",
          eventName: "Annual Tech Conference"
        },
        {
          id: "3",
          title: "Order promotional materials",
          description: "Design and order banners, brochures, and swag items",
          dueDate: "2025-05-01",
          completed: false,
          priority: 'medium',
          eventId: "101",
          eventName: "Annual Tech Conference"
        },
        {
          id: "4",
          title: "Prepare workshop materials",
          description: "Create slides, exercises, and handouts for the training workshop",
          dueDate: "2025-04-10",
          completed: false,
          priority: 'high',
          eventId: "102",
          eventName: "Product Training Workshop"
        },
        {
          id: "5",
          title: "Setup virtual meeting links",
          description: "Create and test Zoom links for all sessions",
          dueDate: "2025-04-15",
          completed: false,
          priority: 'low',
          eventId: "102",
          eventName: "Product Training Workshop"
        }
      ];
      
      setTasks(mockTasks);
      setLoading(false);
    };
    
    if (user) {
      fetchTasks();
    }
  }, [user]);

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast({
        title: task.completed ? "Task marked as pending" : "Task completed",
        description: task.title,
      });
    }
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    if (task) {
      toast({
        title: "Task deleted",
        description: task.title,
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--eventra-blue))] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    // Apply completion filter
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        (task.eventName && task.eventName.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Sort tasks
  const sortedAndFilteredTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      return priorityValues[b.priority] - priorityValues[a.priority];
    }
  });

  // Get priority color
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-blue-500';
      default:
        return '';
    }
  };

  // Format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Your Tasks
        </h1>
        <p className="text-muted-foreground">
          Track and manage tasks for all your events
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Tasks
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Input
              type="search"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'dueDate' | 'priority')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
          
          <Button size="icon" variant="outline" onClick={() => router.push('/tasks/new')}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Tasks List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--eventra-blue))]" />
        </div>
      ) : sortedAndFilteredTasks.length === 0 ? (
        <div className="subtle-gradient-card p-8 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--eventra-blue))]" />
          <h3 className="text-lg font-medium mb-2 text-foreground">No tasks found</h3>
          <p className="text-muted-foreground mb-6">
            {filter === 'all' 
              ? "You don't have any tasks yet. Create your first task to get started." 
              : filter === 'pending' 
                ? "You don't have any pending tasks."
                : "You don't have any completed tasks."}
          </p>
          <Button onClick={() => router.push('/tasks/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAndFilteredTasks.map(task => (
            <div key={task.id} className="subtle-gradient-card p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start gap-4">
                <Checkbox 
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => toggleTaskCompletion(task.id)}
                  className="mt-1"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <label 
                        htmlFor={`task-${task.id}`}
                        className={cn(
                          "font-medium text-foreground cursor-pointer",
                          task.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {task.title}
                      </label>
                      
                      <p className={cn(
                        "text-sm text-muted-foreground mt-1",
                        task.completed && "line-through"
                      )}>
                        {task.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="flex items-center text-xs">
                          <Calendar className="h-3 w-3 mr-1 text-[hsl(var(--eventra-blue))]" />
                          <span>Due: {formatDate(task.dueDate)}</span>
                        </div>
                        
                        {task.eventName && (
                          <div className="flex items-center text-xs">
                            <CalendarRange className="h-3 w-3 mr-1 text-[hsl(var(--eventra-purple))]" />
                            <span>{task.eventName}</span>
                          </div>
                        )}
                        
                        <div className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          getPriorityColor(task.priority)
                        )}>
                          {task.priority}
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 3C8.82843 3 9.5 2.32843 9.5 1.5C9.5 0.671573 8.82843 0 8 0C7.17157 0 6.5 0.671573 6.5 1.5C6.5 2.32843 7.17157 3 8 3Z" fill="currentColor"/>
                            <path d="M8 9.5C8.82843 9.5 9.5 8.82843 9.5 8C9.5 7.17157 8.82843 6.5 8 6.5C7.17157 6.5 6.5 7.17157 6.5 8C6.5 8.82843 7.17157 9.5 8 9.5Z" fill="currentColor"/>
                            <path d="M8 16C8.82843 16 9.5 15.3284 9.5 14.5C9.5 13.6716 8.82843 13 8 13C7.17157 13 6.5 13.6716 6.5 14.5C6.5 15.3284 7.17157 16 8 16Z" fill="currentColor"/>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}/edit`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-500">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 