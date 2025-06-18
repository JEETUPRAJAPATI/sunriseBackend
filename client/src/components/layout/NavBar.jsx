import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function NavBar({ onSidebarToggle }) {
  const { user, logout } = useAuth();
  const [notifications] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="h-16 bg-gradient-to-r from-white/95 to-blue-50/95 dark:from-slate-900/95 dark:to-blue-900/95 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 px-6 shadow-sm">
      <div className="flex items-center justify-between h-full">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden md:flex items-center space-x-6">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Welcome back, {user?.fullName || user?.username}!
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {/* Live Clock */}
            <div className="px-4 py-2 bg-white/70 dark:bg-slate-800/70 rounded-lg border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current Time</div>
              <div className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">
                {currentTime}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-800/70 rounded-lg px-3 py-2 transition-all duration-200"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-800/70 rounded-lg px-3 py-2 transition-all duration-200"
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center shadow-lg animate-pulse">
                {notifications}
              </span>
            )}
          </Button>

          {/* Theme Toggle */}
          <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-1 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
            <ThemeToggle />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
                <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-slate-700 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium">
                    {user?.fullName 
                      ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)
                      : user?.username?.slice(0, 2).toUpperCase() || 'U'
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user?.fullName || user?.username}
                  </p>
                  <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 border-0">
                    {user?.role}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 group-hover:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName || user?.username}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout} 
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}