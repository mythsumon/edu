import { useState } from "react";
import { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shared/ui/collapsible";
import { FormField } from "./FormField";
import { CreateAdminTrainingFormData } from "../../model/admin-training.schema";

interface SchoolInfoSectionProps {
  control: Control<CreateAdminTrainingFormData>;
  register: UseFormRegister<CreateAdminTrainingFormData>;
  errors: FieldErrors<CreateAdminTrainingFormData>;
  isSubmitting: boolean;
}

export const SchoolInfoSection = ({
  register,
  errors,
  isSubmitting,
}: SchoolInfoSectionProps) => {
  const { t } = useTranslation();

  // Internal state for collapsible section
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px]"
    >
      <Card>
        <div className="px-4">
          <div className="flex flex-row justify-between items-start">
            <h2 className="text-lg font-medium">
              {t("training.schoolInformation")}
            </h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="shrink-0">
                {isOpen ? <ChevronUp /> : <ChevronDown />}
                <span className="sr-only">
                  {isOpen ? t("common.collapse") : t("common.expand")}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("training.schoolInformationDescription")}
          </p>
        </div>
        <CollapsibleContent className="px-4">
          {/* Grade, Class, Number of Students - Three columns on tablet+, one column on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
            <FormField
              id="grade"
              label={t("training.gradeLabel")}
              required
              error={errors.grade}
            >
              <Input
                id="grade"
                type="text"
                placeholder={t("training.gradePlaceholder")}
                {...register("grade")}
                className={errors.grade ? "ring-2 ring-destructive" : ""}
                disabled={isSubmitting}
              />
            </FormField>
            <FormField
              id="class"
              label={t("training.classLabel")}
              required
              error={errors.class}
            >
              <Input
                id="class"
                type="text"
                placeholder={t("training.classPlaceholder")}
                {...register("class")}
                className={errors.class ? "ring-2 ring-destructive" : ""}
                disabled={isSubmitting}
              />
            </FormField>
            <FormField
              id="numberOfStudents"
              label={t("training.numberOfStudentsLabel")}
              required
              error={errors.numberOfStudents}
            >
              <Input
                id="numberOfStudents"
                type="number"
                placeholder={t("training.numberOfStudentsPlaceholder")}
                {...register("numberOfStudents", {
                  valueAsNumber: true,
                })}
                className={
                  errors.numberOfStudents ? "ring-2 ring-destructive" : ""
                }
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
