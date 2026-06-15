import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "@/lib/i18n";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as z from "zod";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type TFunction = (key: string) => string;

const createSignUpSchema = (t: TFunction) => z.object({
  email: z.string().email(t("email.error")),
  name: z.string().min(2, t("name.error")),
  password: z.string().min(8, t("password.error")),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t("confirmPassword.error"),
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<ReturnType<typeof createSignUpSchema>>;

export function SignUpPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: sessionData, refetch } = useSession();
  const t = useTranslations("auth.signUp");
  const from = (location.state as { from?: string } | null)?.from;
  const redirectTo = from && !from.startsWith("/sign-") ? from : "/";
  const formSchema = createSignUpSchema(t);

  useEffect(() => {
    if (sessionData?.session) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, sessionData?.session]);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: SignUpFormData) {
    const { email, password, name } = values;
    const { error } = await authClient.signUp.email({ email, password, name });
    if (error) {
      toast({
        variant: "destructive",
        title: t("toast.error.title"),
        description: error.message || t("toast.error.description"),
      });
      return;
    }

    toast({
      title: t("toast.success.title"),
      description: t("toast.success.description"),
    });
    await refetch();
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md p-6 bg-background border rounded-md">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("email.placeholder")} type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("name.placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("password.label")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("confirmPassword.label")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Button disabled={form.formState.isSubmitting} type="submit" className="w-full">
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("submit")}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                {t("haveAccount")}{" "}
                <Link to="/sign-in" className="text-primary hover:underline">
                  {t("signInLink")}
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
