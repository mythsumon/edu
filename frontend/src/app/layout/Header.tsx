import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bell, User, ChevronDown, Settings, LogOut, Moon, Sun, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { STORAGE_KEYS } from "@/shared/constants/storageKeys";
import { useLogoutMutation } from "@/modules/auth/controller/mutations";
import { useUiStore } from "@/shared/stores/ui.store";
import type { UserResponseDto } from "@/modules/auth/model/auth.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/cn";

export const Header = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const logoutMutation = useLogoutMutation();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useUiStore();

  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } catch (error) {
        console.error("Failed to load user from localStorage:", error);
      }
    };
    loadUser();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USER) {
        loadUser();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  ``;

  // Get user display name and role
  const userName =
    user?.admin?.name || user?.instructor?.name || user?.username || "User";
  const userRole =
    user?.roleName?.toUpperCase() === "ADMIN"
      ? t("sidebar.administrator")
      : user?.roleName?.toUpperCase() === "INSTRUCTOR"
      ? t("sidebar.instructor")
      : user?.roleName || "User";

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="py-3 px-4 bg-background flex items-center justify-between border-b border-muted/80">
      {/* Left Side - Sidebar Toggle Button */}
      <div className="flex items-center flex-1">
        <button
          onClick={toggleSidebar}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Right Side - Action Buttons and Profile */}
      <div className="flex items-center gap-x-3">
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="relative flex items-center gap-0.5 py-1 px-1 rounded-full bg-muted/60 backdrop-blur-sm border border-border/30 transition-all hover:bg-muted/80 overflow-hidden"
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {/* Sliding Background Indicator */}
          <div
            className={cn(
              "absolute w-8 h-8 rounded-full bg-primary transition-all duration-300 ease-in-out",
              theme === "dark" ? "left-1" : "left-[calc(100%-2.25rem)]"
            )}
          />
          
          {/* Moon Icon - Dark Mode */}
          <div
            className={cn(
              "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
              theme === "dark" ? "text-primary-foreground" : "text-muted-foreground"
            )}
          >
            <Moon className="w-4 h-4" />
          </div>
          {/* Sun Icon - Light Mode */}
          <div
            className={cn(
              "relative z-10 w-8 h-8 rounded-md flex items-center justify-center transition-all duration-300",
              theme === "light" ? "text-primary-foreground" : "text-muted-foreground"
            )}
          >
            <Sun className="w-4 h-4" />
          </div>
        </button>

        {/* Notification Button */}
        <button
          className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {/* Notification badge */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400 border border-white"></span> */}
        </button>
        
        {/* Profile Section - Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors focus:outline-none w-48">
              {/* Left Side - Profile Picture and Name */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Profile Picture */}
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  {user?.admin?.name || user?.instructor?.name ? (
                    <span className="text-primary font-semibold text-xs">
                      {getInitials(userName)}
                    </span>
                  ) : (
                    <User className="w-5 h-5 text-primary" />
                  )}
                </div>
                {/* Name and Role */}
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground truncate w-full text-left">
                    {userName}
                  </span>
                  <span className="text-xs text-muted-foreground text-left truncate w-full">
                    {userRole}
                  </span>
                </div>
              </div>
              {/* Right Side - Chevron */}
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-2 shadow-sm border-border/50">
            <DropdownMenuItem className="cursor-pointer px-3 py-2">
              <Settings className="h-4 w-4 mr-2" />
              <span>{t("header.profileSettings")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive px-3 py-2"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>
                {logoutMutation.isPending ? t("common.loading") : t("header.logout")}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
