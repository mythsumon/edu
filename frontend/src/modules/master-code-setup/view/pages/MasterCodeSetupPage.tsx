import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/app/layout/PageLayout";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { ROUTES } from "@/shared/constants/routes";
import { useMasterCodeSetupListQuery } from "../../controller/queries";
import { useEffect } from "react";

export const MasterCodeSetupPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useMasterCodeSetupListQuery();

  useEffect(() => {
    if (data) {
      console.log("Master Codes List:", data);
    }
    if (error) {
      console.error("Error fetching master codes:", error);
    }
  }, [data, error]);

  return (
    <PageLayout
      title="Master Code Setup"
      breadcrumbRoot="master-code-setup"
      actions={
        <Button onClick={() => navigate(ROUTES.ADMIN_MASTER_CODE_SETUP_CREATE_FULL)}>
          <Plus className="h-4 w-4" />
          Create New
        </Button>
      }
    >
      {/* Page content goes here */}
      <div className="mt-4">
        <p>Page content area</p>
        {isLoading && <p>Loading master codes...</p>}
      </div>
    </PageLayout>
  );
};
