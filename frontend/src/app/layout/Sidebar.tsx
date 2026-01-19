import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@/shared/stores/ui.store";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/constants/routes";
import { STORAGE_KEYS } from "@/shared/constants/storageKeys";
import type { UserResponseDto } from "@/modules/auth/model/auth.types";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Users,
  FileCode,
  Building2,
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
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen, setSidebarCollapsed } = useUiStore();
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [wasCollapsedBeforeHover, setWasCollapsedBeforeHover] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

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
            href: ROUTES.ADMIN_DASHBOARD_FULL,
            icon: LayoutDashboard,
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
        titleKey: "sidebar.institution",
        items: [
          {
            nameKey: "sidebar.institutionManagement",
            href: ROUTES.ADMIN_INSTITUTION_FULL,
            icon: Building2,
          },
        ],
      },
      {
        titleKey: "sidebar.program",
        items: [
          {
            nameKey: "sidebar.programManagement",
            href: ROUTES.ADMIN_PROGRAM_MANAGEMENT_FULL,
            icon: BookOpen,
          },
        ],
      },
      {
        titleKey: "sidebar.system",
        items: [
          {
            nameKey: "sidebar.commonCode",
            href: ROUTES.ADMIN_COMMON_CODE_FULL,
            icon: FileCode,
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
        ],
      },
      {
        titleKey: "sidebar.lecture",
        items: [
          {
            nameKey: "sidebar.myLectureList",
            href: ROUTES.INSTRUCTOR_SCHEDULE_LIST_FULL,
            icon: Calendar,
          },
          {
            nameKey: "sidebar.checkConfirmedClasses",
            href: ROUTES.INSTRUCTOR_SCHEDULE_CONFIRMED_FULL,
            icon: Calendar,
          },
          {
            nameKey: "sidebar.ongoingTraining",
            href: ROUTES.INSTRUCTOR_SCHEDULE_ONGOING_FULL,
            icon: Calendar,
          },
          {
            nameKey: "sidebar.completedTraining",
            href: ROUTES.INSTRUCTOR_SCHEDULE_COMPLETED_FULL,
            icon: Calendar,
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

  const isActiveRoute = (href: string) => {
    // Exact match
    if (location.pathname === href) return true;
    // Check if current path starts with the menu item href (for child routes)
    // Only match if it's a path segment boundary (not just a substring)
    return location.pathname.startsWith(href + "/") || location.pathname.startsWith(href + "?");
  };

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when drawer is open on mobile
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen, setSidebarOpen]);

  // Close drawer when route changes (mobile/tablet)
  useEffect(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      {/* Overlay for mobile/tablet */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        onMouseEnter={() => {
          // On desktop: if collapsed, expand on hover
          if (sidebarCollapsed) {
            setWasCollapsedBeforeHover(true);
            setSidebarCollapsed(false);
          }
        }}
        onMouseLeave={() => {
          // On desktop: if it was collapsed before hover, collapse again
          if (wasCollapsedBeforeHover) {
            setSidebarCollapsed(true);
            setWasCollapsedBeforeHover(false);
          }
        }}
        className={cn(
          "bg-background flex flex-col overflow-hidden py-4",
          // Border (right border since sidebar is on the left)
          "border-r border-secondary-foreground/10",
          // Width based on collapsed state with smooth transition
          sidebarCollapsed
            ? "w-16 min-w-16 max-w-24"
            : "w-64 min-w-52 max-w-72",
          "transition-all duration-300 ease-in-out",
          // Mobile/Tablet: fixed drawer from left with smooth slide animation
          "fixed left-0 top-0 h-screen z-50",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Disable pointer events when off-screen on mobile
          !sidebarOpen && "pointer-events-none lg:pointer-events-auto",
          // Desktop: always visible, relative positioning, no transform, always flex
          "lg:relative lg:translate-x-0 lg:flex"
        )}
      >
        {/* Sidebar Header with Logo */}
        <div className="h-16 flex items-center px-4">
          <div className="flex items-center justify-center gap-3 w-full">
            <img
              src={logoImage}
              alt={t("sidebar.educationManagementSystem")}
              className={cn(
                "h-auto object-contain transition-opacity duration-300 ease-in-out",
                sidebarCollapsed ? "w-0 opacity-0" : "w-40 opacity-100"
              )}
            />
          </div>
        </div>
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.titleKey} className="space-y-2">
                <p
                  className={cn(
                    "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 px-1 transition-opacity duration-300 ease-in-out",
                    sidebarCollapsed
                      ? "opacity-0 h-0 overflow-hidden"
                      : "opacity-100"
                  )}
                >
                  {t(section.titleKey)}
                </p>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    const itemName = t(item.nameKey);

                    return (
                      <li key={item.nameKey}>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                            sidebarCollapsed ? "justify-center" : "",
                            isActive
                              ? "bg-badge text-primary font-semibold"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <item.icon
                            className={`h-4 w-4 flex-shrink-0  ${
                              sidebarCollapsed ? "ml-2.5" : "ml-0"
                            }`}
                          />
                          <span
                            className={cn(
                              "text-sm font-normal truncate transition-opacity duration-300 ease-in-out",
                              sidebarCollapsed
                                ? "opacity-0 w-0 overflow-hidden"
                                : "opacity-100"
                            )}
                          >
                            {itemName}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
};
