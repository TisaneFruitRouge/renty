"use client";

import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { CreditCard } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUserId } from "../../lib/current-user";

type PaymentMethodType = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

export function PaymentMethodCard() {
  const t = useTranslations("settings");
  const { toast } = useToast();
  const userId = useCurrentUserId();
  const getPaymentMethod = useAction(api.subscriptionBilling.getPaymentMethod);
  const createCustomerPortalSession = useAction(api.subscriptionBilling.createCustomerPortalSession);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchPaymentMethod() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await getPaymentMethod({ userId });
        if (isMounted && result.success && result.paymentMethod) {
          setPaymentMethod(result.paymentMethod);
        }
      } catch (error) {
        console.error("Error fetching payment method:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchPaymentMethod();
    return () => {
      isMounted = false;
    };
  }, [getPaymentMethod, userId]);

  const openCustomerPortal = async () => {
    if (!userId) return;

    try {
      setIsRedirecting(true);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const result = await createCustomerPortalSession({
        userId,
        returnUrl: `${origin}/settings?tab=subscription`,
      });

      if (result.success && result.url) {
        window.location.href = result.url;
        return;
      }

      toast({
        title: "Erreur",
        description: "Impossible d'accéder au portail de paiement",
        variant: "destructive",
      });
      setIsRedirecting(false);
    } catch (error) {
      console.error("Error redirecting to customer portal:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
      setIsRedirecting(false);
    }
  };

  return (
    <div className="rounded-lg border p-4 bg-card">
      <h3 className="font-medium mb-3">{t("subscription.payment-method")}</h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">{t("subscription.loading")}</span>
        </div>
      ) : paymentMethod ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-14 bg-muted rounded mr-3 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{t("subscription.payment-method-card")}</p>
              <p className="text-xs text-muted-foreground">
                •••• {paymentMethod.last4}, {t("subscription.expires")} {paymentMethod.expMonth}/
                {paymentMethod.expYear.toString().slice(-2)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" disabled={isRedirecting} onClick={openCustomerPortal}>
            {isRedirecting ? "Redirection..." : t("subscription.update-payment-method")}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-14 bg-muted rounded mr-3 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{t("subscription.no-payment-method")}</p>
        </div>
        <Button variant="outline" size="sm" disabled={isRedirecting} onClick={openCustomerPortal}>
          {isRedirecting ? "Redirection..." : t("subscription.add-payment-method")}
        </Button>
      </div>
      )}
    </div>
  );
}
