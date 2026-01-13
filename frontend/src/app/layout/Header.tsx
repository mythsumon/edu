import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@/shared/stores/ui.store";
import { Search, Bell, Globe, LayoutGrid, User } from "lucide-react";
import { STORAGE_KEYS } from "@/shared/constants/storageKeys";
import type { UserResponseDto } from "@/modules/auth/model/auth.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/cn";

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useUiStore();
  const [user, setUser] = useState<UserResponseDto | null>(null);

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
  }, []);``

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

  // Handle language change
  const handleLanguageChange = (lang: "en" | "ko") => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <header className="h-20 bg-background flex items-center justify-between pr-5 pl-3">
      {/* Left Side - Profile, Welcome, Name, Role */}
      <div className="flex items-center gap-4 flex-1">
        {/* Profile Picture with Badge */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border border-secondary shadow-sm">
            {user?.admin?.name || user?.instructor?.name ? (
              <span className="text-primary font-semibold text-sm">
                {getInitials(userName)}
              </span>
            ) : (
              <User className="w-6 h-6 text-primary" />
            )}
          </div>
        </div>
        {/* Welcome Message, Name, and Role */}
        <div className="flex flex-col">
          {/* <span className="text-xs text-muted-foreground">
            {t("header.welcome")}
          </span> */}
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-foreground">
              {userName}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{userRole}</span>
        </div>
      </div>

      {/* Right Side - Action Buttons */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {/* Notification Button */}
        <button
          className="w-10 h-10 rounded-xl hover:bg-purple-700 flex items-center justify-center text-white transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {/* Notification badge */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400 border border-white"></span> */}
        </button>

        {/* Language Change Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white transition-colors"
              aria-label="Change Language"
            >
              <Globe className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => handleLanguageChange("en")}
              className={cn("cursor-pointer", language === "en" && "bg-accent")}
            >
              {t("language.english")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleLanguageChange("ko")}
              className={cn("cursor-pointer", language === "ko" && "bg-accent")}
            >
              {t("language.korean")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
