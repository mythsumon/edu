import { useLocation, Link, useNavigate } from "react-router-dom";
import { useMemo, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";

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

interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
  breadcrumbRoot?: string; // Root segment for breadcrumb (e.g., "master-code-setup")
  children?: ReactNode;
}

export const PageLayout = ({
  title,
  description,
  actions,
  badge,
  breadcrumbRoot,
  children,
}: PageLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Build breadcrumb items from current path
  const breadcrumbItems = useMemo(() => {
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
  }, [location.pathname, breadcrumbRoot]);

  // Determine if this is a nested page (has more than one breadcrumb item)
  const isNestedPage = breadcrumbItems.length > 1;
  // Get parent route (second to last item if nested, or null)
  const parentRoute =
    isNestedPage && breadcrumbItems.length > 1
      ? breadcrumbItems[breadcrumbItems.length - 2].path
      : null;

  return (
    <div className="space-y-2">
      {/* Back Button - Only show on nested pages */}
      {isNestedPage && parentRoute && (
        <Button
          variant="link"
          size="sm"
          onClick={() => navigate(parentRoute)}
          className="text-muted-foreground hover:text-foreground p-0 h-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      )}
      {/* Header Section: Title, Description, Badge, and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left Side: Title, Description, Badge */}
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold">{title}</h1>
            {badge && <div className="flex-shrink-0">{badge}</div>}
          </div>
          {/* Breadcrumb with optional back button */}
          {breadcrumbItems.length > 0 && (
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
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};
