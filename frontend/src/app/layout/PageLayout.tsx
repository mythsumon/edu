import { useLocation, Link } from "react-router-dom";
import { useMemo, ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/constants/routes";

// Route segment to display name mapping
const routeSegmentMap: Record<string, string> = {
  "master-code-setup": "Master Code Setup",
  create: "Create",
  edit: "Edit",
  view: "View",
  dashboard: "Dashboard",
  "education-operations": "Education Operations",
  "instructor-assignment": "Instructor Assignment",
  "reference-information-management": "Reference Information Management",
  "system-management": "System Management",
  "account-management": "Account Management",
  settings: "Settings",
  institution: "Institution",
  program: "Program",
  instructor: "Instructor",
  application: "Application",
  allocation: "Allocation",
  confirmation: "Confirmation",
  admins: "Admins",
  instructors: "Instructors",
};

interface CustomBreadcrumbRoot {
  path: string;
  label: string;
}

interface PageLayoutProps {
  title: string;
  actions?: ReactNode;
  badge?: ReactNode;
  breadcrumbRoot?: string; // Root segment for breadcrumb (e.g., "master-code-setup") or "/" for "Home > [last segment]"
  customBreadcrumbRoot?: CustomBreadcrumbRoot; // Custom root path and label (e.g., { path: "/admin/dashboard", label: "Dashboard" })
  disableBreadcrumb?: boolean; // If true, breadcrumb will not be displayed
  children?: ReactNode;
}

export const PageLayout = ({
  title,
  actions,
  badge,
  breadcrumbRoot,
  customBreadcrumbRoot,
  disableBreadcrumb,
  children,
}: PageLayoutProps) => {
  const location = useLocation();

  // Build breadcrumb items from current path
  const breadcrumbItems = useMemo(() => {
    // Custom breadcrumb root takes precedence
    if (customBreadcrumbRoot) {
      const pathSegments = location.pathname
        .split("/")
        .filter(
          (segment) =>
            segment !== "" && segment !== "admin" && segment !== "instructor"
        );

      if (pathSegments.length === 0) {
        return [];
      }

      const lastSegment = pathSegments[pathSegments.length - 1];
      const displayName =
        routeSegmentMap[lastSegment] ||
        lastSegment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

      return [
        {
          segment: "custom-root",
          displayName: customBreadcrumbRoot.label,
          path: customBreadcrumbRoot.path,
          isLast: false,
          key: "custom-root",
        },
        {
          segment: lastSegment,
          displayName,
          path: location.pathname,
          isLast: true,
          key: lastSegment,
        },
      ];
    }

    // Special case: "/" as breadcrumbRoot means "Home > [last segment]"
    if (breadcrumbRoot === "/") {
      const pathSegments = location.pathname
        .split("/")
        .filter(
          (segment) =>
            segment !== "" && segment !== "admin" && segment !== "instructor"
        );

      if (pathSegments.length === 0) {
        return [];
      }

      const lastSegment = pathSegments[pathSegments.length - 1];
      const displayName =
        routeSegmentMap[lastSegment] ||
        lastSegment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

      // Determine dashboard path based on route
      const dashboardPath = location.pathname.startsWith("/admin")
        ? ROUTES.ADMIN_DASHBOARD_FULL
        : ROUTES.INSTRUCTOR_DASHBOARD_FULL;

      return [
        {
          segment: "home",
          displayName: "Home",
          path: dashboardPath,
          isLast: false,
          key: "home",
        },
        {
          segment: lastSegment,
          displayName,
          path: location.pathname,
          isLast: true,
          key: lastSegment,
        },
      ];
    }

    const pathSegments = location.pathname
      .split("/")
      .filter(
        (segment) =>
          segment !== "" && segment !== "admin" && segment !== "instructor"
      );

    // Find the root segment for breadcrumb
    let rootIndex = -1;
    if (breadcrumbRoot) {
      rootIndex = pathSegments.findIndex((seg) => seg === breadcrumbRoot);
    } else {
      // Auto-detect root: find the first segment that's not a common route
      // For admin routes, start from the first segment after /admin
      rootIndex = pathSegments.length > 0 ? 0 : -1;
    }

    if (rootIndex === -1 || pathSegments.length === 0) {
      return [];
    }

    // Get segments from root onwards
    const relevantSegments = pathSegments.slice(rootIndex);

    return relevantSegments.map((segment, index) => {
      const isLast = index === relevantSegments.length - 1;
      const displayName =
        routeSegmentMap[segment] ||
        segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

      // Determine base path (admin or instructor)
      const basePath = location.pathname.startsWith("/admin")
        ? "/admin"
        : "/instructor";

      // Build path up to this segment
      const pathToSegment = `${basePath}/${relevantSegments
        .slice(0, index + 1)
        .join("/")}`;

      return {
        segment,
        displayName,
        path: pathToSegment,
        isLast,
        key: `${segment}-${index}`,
      };
    });
  }, [location.pathname, breadcrumbRoot, customBreadcrumbRoot]);


  return (
    <div className="space-y-1 pb-6">
      {/* Header Section: Title, Badge, and Actions */}
      <div className="flex sticky top-0 bg-background z-30 px-5 py-4 border-b border-border flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left Side: Title, Badge */}
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold">{title}</h1>
            {badge && <div className="flex-shrink-0">{badge}</div>}
          </div>
          {/* Breadcrumb with optional back button */}
          {!disableBreadcrumb && breadcrumbItems.length > 0 && (
            <div className="flex flex-col items-start gap-2">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbItems.map((item, index) => (
                    <div
                      key={item.key || `${item.segment}-${index}`}
                      className="flex items-center"
                    >
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link
                            to={item.path}
                            className={cn(
                              "transition-colors text-xs",
                              item.isLast
                                ? "text-primary font-semibold cursor-default"
                                : "text-primary hover:text-primary/80 cursor-pointer"
                            )}
                          >
                            {item.displayName}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {index < breadcrumbItems.length - 1 && (
                        <BreadcrumbSeparator className="text-muted-foreground pt-px ml-3" />
                      )}
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
        </div>

        {/* Right Side: Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 sm:flex-nowrap">
            {actions}
          </div>
        )}
      </div>

      {/* Page Content */}
      {children && <div className="px-5">{children}</div>}
    </div>
  );
};
