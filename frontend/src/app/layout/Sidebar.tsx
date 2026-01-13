import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@/shared/stores/ui.store";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/constants/routes";
import { STORAGE_KEYS } from "@/shared/constants/storageKeys";
import type { UserResponseDto } from "@/modules/auth/model/auth.types";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/ui/tooltip";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  FileStack,
  Settings,
  Calendar,
  Users,
  ClipboardList,
  Award,
} from "lucide-react";
import logoImage from "@/assets/images/logo/logo.png";

interface MenuItem {
  nameKey: string;
  href: string;
  icon: typeof LayoutDashboard;
}

interface MenuSection {
  titleKey: string;
  items: MenuItem[];
}

export const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { sidebarCollapsed } = useUiStore();
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

    // Listen for storage changes (in case user is updated elsewhere)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USER) {
        loadUser();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Get user role
  const userRole = user?.roleName?.toUpperCase();

  // Admin navigation sections
  const adminSections: MenuSection[] = useMemo(
    () => [
      {
        titleKey: "sidebar.menu",
        items: [
          {
            nameKey: "sidebar.dashboard",
            href: ROUTES.ADMIN_DASHBOARD,
            icon: LayoutDashboard,
          },
          {
            nameKey: "sidebar.educationOperations",
            href: ROUTES.EDUCATION_OPERATIONS,
            icon: BookOpen,
          },
          {
            nameKey: "sidebar.instructorAssignment",
            href: ROUTES.INSTRUCTOR_ASSIGNMENT,
            icon: GraduationCap,
          },
          {
            nameKey: "sidebar.referenceInformationManagement",
            href: ROUTES.REFERENCE_INFORMATION_MANAGEMENT,
            icon: FileStack,
          },
        ],
      },
      {
        titleKey: "sidebar.accountManagement",
        items: [
          {
            nameKey: "sidebar.adminAccounts",
            href: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_FULL,
            icon: Users,
          },
          {
            nameKey: "sidebar.instructorAccounts",
            href: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_FULL,
            icon: Users,
          },
        ],
      },
      {
        titleKey: "sidebar.system",
        items: [
          {
            nameKey: "sidebar.systemManagement",
            href: ROUTES.SYSTEM_MANAGEMENT,
            icon: Settings,
          },
        ],
      },
    ],
    []
  );

  // Instructor navigation sections
  const instructorSections: MenuSection[] = useMemo(
    () => [
      {
        titleKey: "sidebar.menu",
        items: [
          {
            nameKey: "sidebar.dashboard",
            href: ROUTES.INSTRUCTOR_DASHBOARD,
            icon: LayoutDashboard,
          },
          {
            nameKey: "sidebar.myClasses",
            href: ROUTES.EDUCATION_OPERATIONS,
            icon: BookOpen,
          },
          {
            nameKey: "sidebar.mySchedule",
            href: ROUTES.INSTRUCTOR_ASSIGNMENT,
            icon: Calendar,
          },
          {
            nameKey: "sidebar.myStudents",
            href: ROUTES.REFERENCE_INFORMATION_MANAGEMENT,
            icon: Users,
          },
        ],
      },
      {
        titleKey: "sidebar.academic",
        items: [
          {
            nameKey: "sidebar.attendance",
            href: ROUTES.SYSTEM_MANAGEMENT,
            icon: ClipboardList,
          },
          {
            nameKey: "sidebar.grades",
            href: ROUTES.SETTINGS_AND_USER_MANAGEMENT,
            icon: Award,
          },
        ],
      },
    ],
    []
  );

  // Select navigation based on role
  const sections: MenuSection[] = useMemo(() => {
    if (userRole === "ADMIN") {
      return adminSections;
    }
    if (userRole === "INSTRUCTOR") {
      return instructorSections;
    }
    return adminSections;
  }, [userRole, adminSections, instructorSections]);

  const isActiveRoute = (href: string) => location.pathname === href;

  return (
    <aside
      className={cn(
        "bg-background transition-all duration-300 flex flex-col overflow-hidden border-r border-secondary/50 py-4",
        sidebarCollapsed ? "w-16 min-w-16 max-w-24" : "w-64 min-w-52 max-w-72"
      )}
    >
      {/* Sidebar Header with Logo */}
      <div className="h-16 flex items-center px-4">
        <div className="flex items-center justify-center gap-3 w-full">
          {!sidebarCollapsed && (
            <img
              src={logoImage}
              alt={t("sidebar.educationManagementSystem")}
              className="w-40 h-auto object-contain"
            />
          )}
        </div>
      </div>
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.titleKey}>
              {!sidebarCollapsed && (
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 px-1">
                  {t(section.titleKey)}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = isActiveRoute(item.href);
                  const itemName = t(item.nameKey);

                  return (
                    <li key={item.nameKey}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                              sidebarCollapsed ? "justify-center" : "",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground hover:bg-muted"
                            )}
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            {!sidebarCollapsed && (
                              <span className="text-sm font-medium text-secondary-foreground truncate">
                                {itemName}
                              </span>
                            )}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          sideOffset={12}
                          className="z-[100] border-border/30 shadow-sm"
                        >
                          <p className="text-xs">{itemName}</p>
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Logout Card - Sticky at Bottom */}
      {/* <div className="sticky bottom-0 p-2 bg-background">
        <div className="bg-card rounded-lg p-3 shadow-sm">
          {!sidebarCollapsed ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">
                {logoutMutation.isPending ? t("common.loading") : t("common.logout")}
              </span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div> */}
    </aside>
  );
};
