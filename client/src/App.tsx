import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Prevent video download through keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+S (Save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
      
      // Prevent F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Disable right-click globally for additional protection
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'VIDEO') {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
