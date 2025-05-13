
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

const TopBar = () => {
  return (
    <div className="border-b border-border">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center space-x-2 md:w-56">
          <form className="hidden md:flex flex-1">
            <div className="relative">
              <Search
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search cameras..."
                className="w-64 pl-8 bg-secondary/50"
              />
            </div>
          </form>
        </div>

        <div className="ml-auto flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button variant="outline" className="hidden md:flex">
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
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
