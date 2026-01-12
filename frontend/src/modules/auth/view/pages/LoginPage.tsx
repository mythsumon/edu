import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { useAuthStore } from "@/shared/stores/auth.store";
import { ROUTES } from "@/shared/constants/routes";
import { STORAGE_KEYS } from "@/shared/constants/storageKeys";
import { loginSchema, type LoginFormData } from "../../model/auth.schema";
import { useLoginMutation } from "../../controller/mutations";
import bgLoginImage from "@/assets/images/background/bg-login.png";

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Get user role from localStorage to determine dashboard route
      try {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER)
        if (userStr) {
          const user = JSON.parse(userStr)
          const userRole = user?.roleName?.toUpperCase()
          if (userRole === 'ADMIN') {
            navigate(ROUTES.ADMIN_DASHBOARD, { replace: true })
          } else if (userRole === 'INSTRUCTOR') {
            navigate(ROUTES.INSTRUCTOR_DASHBOARD, { replace: true })
          } else {
            navigate(ROUTES.DASHBOARD, { replace: true })
          }
        } else {
          navigate(ROUTES.DASHBOARD, { replace: true })
        }
      } catch (error) {
        navigate(ROUTES.DASHBOARD, { replace: true })
      }
    }
  }, [isAuthenticated, navigate]);

  // Handle login errors
  useEffect(() => {
    if (loginMutation.isError) {
      setErrorMessage(
        loginMutation.error instanceof Error
          ? loginMutation.error.message
          : t("auth.invalidCredentials")
      );
      setShowErrorDialog(true);
    }
  }, [loginMutation.isError, loginMutation.error, t]);

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgLoginImage})`,
        }}
      />

      {/* Content Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo above the card */}
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-3xl font-bold text-primary">{t("auth.title")}</h1>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-lg shadow-lg p-8">
          {/* Header */}
          <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
            {t("auth.loginTitle")}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            {t("auth.loginSubtitle")}
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-primary" />
                <Label htmlFor="username" className="text-foreground">
                  {t("auth.username")}
                </Label>
              </div>
              <Input
                id="username"
                type="text"
                placeholder={t("auth.usernamePlaceholder")}
                {...register("username")}
                className={errors.username ? "border-destructive" : ""}
                disabled={loginMutation.isPending}
              />
              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="h-4 w-4 text-primary" />
                <Label htmlFor="password" className="text-foreground">
                  {t("common.password")}
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.passwordPlaceholder")}
                  {...register("password")}
                  disabled={loginMutation.isPending}
                  className={
                    errors.password ? "border-destructive pr-10" : "pr-10"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loginMutation.isPending}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? t("auth.loggingIn")
                : t("auth.loginButton")}
            </Button>
          </form>
        </div>
      </div>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("auth.loginFailed")}</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowErrorDialog(false)}>
              {t("common.close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
