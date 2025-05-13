
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bell,
  PlusCircle,
  Search,
  User,
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const TopBar = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        
        <div className="hidden md:flex md:w-56 items-center gap-2">
          <div className="bg-vision-blue-500 p-1.5 rounded">
            <Bell size={20} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold">Vision Hub</h2>
        </div>

        <div className="flex-1">
          <form className="hidden md:flex max-w-sm">
            <div className="relative w-full">
              <Search
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search cameras, recordings, alerts..."
                className="w-full pl-8 bg-secondary/50"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">3</Badge>
          </Button>
          
          <Separator orientation="vertical" className="hidden md:block h-8" />
          
          <Button variant="outline" className="hidden lg:flex">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Camera
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-border"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="grid gap-0.5">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@visionhub.com</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">System Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="p-2 md:hidden">
                <ThemeToggle />
              </div>
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
