import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Check } from "lucide-react";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useAuthStore } from "@/shared/stores/auth.store";
import { useUiStore } from "@/shared/stores/ui.store";
import { ROUTES } from "@/shared/constants/routes";
import { STORAGE_KEYS } from "@/shared/constants/storageKeys";
import { createLoginSchema, type LoginFormData } from "../../model/auth.schema";
import { useLoginMutation } from "../../controller/mutations";
import logoImage from "@/assets/images/logo/logo.png";
import i18n from "@/app/config/i18n";
import { cn } from "@/shared/lib/cn";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
];

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { language, setLanguage, theme } = useUiStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loginMutation = useLoginMutation();

  // Create schema with current language translations
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loginSchema = useMemo(() => createLoginSchema(), [language]);

  const handleLanguageChange = (langCode: "en" | "ko") => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
  };

  const currentLanguage =
    languages.find((lang) => lang.code === language) || languages[0];

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
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        if (userStr) {
          const user = JSON.parse(userStr);
          const userRole = user?.roleName?.toUpperCase();
          if (userRole === "ADMIN") {
            navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
          } else if (userRole === "INSTRUCTOR") {
            navigate(ROUTES.INSTRUCTOR_DASHBOARD, { replace: true });
          } else {
            navigate(ROUTES.DASHBOARD, { replace: true });
          }
        } else {
          navigate(ROUTES.DASHBOARD, { replace: true });
        }
      } catch (error) {
        navigate(ROUTES.DASHBOARD, { replace: true });
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
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden ${
        theme === "dark" ? "bg-background" : "bg-white"
      }`}
    >
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-x-2 ">
              <span className="hidden sm:inline">{currentLanguage.flag}</span>
              <span className="hidden sm:inline">{currentLanguage.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[150px] backdrop-blur-xl bg-gradient-to-b from-card/80 via-card/70 to-card/90 border border-secondary/50 shadow-lg"
            style={{
              background:
                "linear-gradient(to bottom, hsl(var(--card) / 0.8), hsl(var(--card) / 0.7), hsl(var(--card) / 0.9))",
            }}
          >
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code as "en" | "ko")}
                className="cursor-pointer hover:bg-accent/50"
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

      {/* Content Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo above the card */}
        <div className="flex items-center justify-center mb-0">
          <img src={logoImage} alt={t("auth.title")} className="w-48 h-auto" />
        </div>

        {/* Login Card - Glassmorphism Effect */}
        <div
          className="relative rounded-3xl p-8 backdrop-blur-xl bg-gradient-to-b from-card/80 via-card/70 to-card/90 border border-secondary/50 shadow-lg"
          style={{
            background:
              "linear-gradient(to bottom, hsl(var(--card) / 0.8), hsl(var(--card) / 0.7), hsl(var(--card) / 0.9))",
          }}
        >
          {/* Header */}
          <h2 className="text-xl font-semibold text-foreground mb-2 text-center">
            {t("auth.loginTitle")}
          </h2>
          <p className="text-sm text-muted-foreground mb-8 text-center">
            {t("auth.loginSubtitle")}
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* User ID Input */}
            <div className="space-y-2">
              <Label htmlFor="username">{t("auth.userId")}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t("auth.usernamePlaceholder")}
                {...register("username")}
                className={cn(
                  "h-12 rounded-lg bg-background",
                  errors.username ? "ring-2 ring-destructive" : ""
                )}
                disabled={loginMutation.isPending}
              />
              {errors.username && (
                <p className="text-xs text-destructive px-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.passwordPlaceholder")}
                  {...register("password")}
                  className={cn(
                    "h-12 rounded-lg bg-background",
                    errors.password ? "ring-2 ring-destructive pr-12" : "pr-12"
                  )}
                  disabled={loginMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loginMutation.isPending}
                >
                  {!showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive px-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-8"
              size="default"
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
