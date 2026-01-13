import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  User,
  ChevronDown,
  Settings,
  LogOut,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Check,
} from "lucide-react";
import { STORAGE_KEYS } from "@/shared/constants/storageKeys";
import { useLogoutMutation } from "@/modules/auth/controller/mutations";
import { useUiStore } from "@/shared/stores/ui.store";
import type { UserResponseDto } from "@/modules/auth/model/auth.types";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/cn";
import logoImage from "@/assets/images/logo/logo.png";
import i18n from "@/app/config/i18n";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
];

export const Header = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const logoutMutation = useLogoutMutation();
  const {
    theme,
    toggleTheme,
    sidebarCollapsed,
    toggleSidebar,
    sidebarOpen,
    toggleSidebarOpen,
    language,
    setLanguage,
  } = useUiStore();

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

  const handleLanguageChange = (langCode: "en" | "ko") => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
  };

  const currentLanguage =
    languages.find((lang) => lang.code === language) || languages[0];

  return (
    <header className="py-3 px-4 bg-background flex items-center justify-between border-b border-muted/80 relative">
      {/* Left Side - Sidebar Toggle Button */}
      <div className="flex items-center">
        {/* Mobile/Tablet: Menu button to open drawer */}
        <button
          onClick={toggleSidebarOpen}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground lg:hidden"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Desktop: Sidebar collapse/expand button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex w-9 h-9 rounded-lg items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Center - Logo (Mobile/Tablet only) */}
      <div className="absolute left-1/2 transform -translate-x-1/2 lg:hidden">
        <img
          src={logoImage}
          alt={t("sidebar.educationManagementSystem")}
          className="h-16 w-auto object-contain"
        />
      </div>

      {/* Right Side - Action Buttons and Profile */}
      <div className="flex items-center gap-x-3">
        {/* Desktop: Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="hidden lg:flex relative items-center gap-0.5 py-1 px-1 rounded-full bg-muted/60 backdrop-blur-sm border border-border/30 transition-all hover:bg-muted/80 overflow-hidden"
          aria-label={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
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
              theme === "dark"
                ? "text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            <Moon className="w-4 h-4" />
          </div>
          {/* Sun Icon - Light Mode */}
          <div
            className={cn(
              "relative z-10 w-8 h-8 rounded-md flex items-center justify-center transition-all duration-300",
              theme === "light"
                ? "text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            <Sun className="w-4 h-4" />
          </div>
        </button>

        {/* Mobile/Tablet: Notification Button (to the right of profile avatar) */}
        <button
          className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground transition-colors relative lg:hidden"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Desktop: Notification Button */}
        <button
          className="hidden lg:flex w-9 h-9 rounded-full bg-primary hover:bg-primary/90 items-center justify-center text-primary-foreground transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Profile Section - Popover */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center transition-colors focus:outline-none",
                // Mobile/Tablet: Only Avatar
                "lg:hidden w-10 h-10 rounded-full bg-secondary lg:bg-background justify-center hover:bg-muted flex-shrink-0",
                // Desktop: Full Profile with Name and Role (no background)
                "lg:flex lg:justify-between lg:gap-2 lg:px-2 lg:py-1.5 lg:rounded-lg lg:w-48"
              )}
            >
              {/* Mobile/Tablet: Only Avatar */}
              <div className="lg:hidden flex items-center justify-center">
                {user?.admin?.name || user?.instructor?.name ? (
                  <span className="text-primary font-semibold text-xs">
                    {getInitials(userName)}
                  </span>
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
              {/* Desktop: Full Profile with Name and Role */}
              <div className="hidden lg:flex items-center gap-2 min-w-0 flex-1">
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
              {/* Desktop: Chevron */}
              <ChevronDown className="hidden lg:block w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-56 p-2 shadow-sm border-border/50 rounded-xl"
          >
            {/* Profile Info at Top (All Views) */}
            <div className="px-3 py-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                {/* Profile Picture */}
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  {user?.admin?.name || user?.instructor?.name ? (
                    <span className="text-primary font-semibold text-sm">
                      {getInitials(userName)}
                    </span>
                  ) : (
                    <User className="w-6 h-6 text-primary" />
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
            </div>

            {/* Mobile/Tablet: Theme Toggle */}
            <div className="lg:hidden px-3 py-2 border-b border-border/50 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {t("header.theme")}
                </span>
                <button
                  onClick={toggleTheme}
                  className="relative flex items-center gap-0.5 py-1 px-1 rounded-full bg-muted/60 backdrop-blur-sm border border-border/30 transition-all hover:bg-muted/80 overflow-hidden"
                  aria-label={
                    theme === "light"
                      ? "Switch to dark mode"
                      : "Switch to light mode"
                  }
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
                      theme === "dark"
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <Moon className="w-4 h-4" />
                  </div>
                  {/* Sun Icon - Light Mode */}
                  <div
                    className={cn(
                      "relative z-10 w-8 h-8 rounded-md flex items-center justify-center transition-all duration-300",
                      theme === "light"
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <Sun className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>

            {/* Profile Settings */}
            <button
              className="w-full flex items-center cursor-pointer px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
              onClick={() => setPopoverOpen(false)}
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="text-sm">{t("header.profileSettings")}</span>
            </button>

            {/* Logout */}
            <button
              className="w-full flex items-center cursor-pointer text-destructive hover:bg-muted px-3 py-2 rounded-md transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                handleLogout();
                setPopoverOpen(false);
              }}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {logoutMutation.isPending
                  ? t("common.loading")
                  : t("header.logout")}
              </span>
            </button>
          </PopoverContent>
        </Popover>

        {/* Desktop: Language Selector */}
        <div className="hidden lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label={t("language.changeLanguage")}
              >
                <span className="text-xl">{currentLanguage.flag}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[150px]">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code as "en" | "ko")}
                  className="cursor-pointer"
                >
                  <span className="mr-2">{lang.flag}</span>
                  <span className="flex-1">{lang.name}</span>
                  {language === lang.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
