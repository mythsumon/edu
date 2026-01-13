import { PageLayout } from "@/app/layout/PageLayout";
import { Button } from "@/shared/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";

export const MasterCodeCreatePage = () => {
  const navigate = useNavigate();

  return (
    <PageLayout
      title="Create Master Code"
      description="Add a new master code to the system"
      breadcrumbRoot="master-code-setup"
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.ADMIN_MASTER_CODE_SETUP_FULL)}
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
          <Button>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </>
      }
    >
      {/* Dummy form content for testing */}
      <div className="mt-6 space-y-6">
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium">Master Code Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Code Name
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dummy input field for code name
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Code Value
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dummy input field for code value
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dummy textarea field for description
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium">Additional Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Status
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dummy select field for status
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Category
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dummy select field for category
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
