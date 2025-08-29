'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { getPaymentMethodAction, createCustomerPortalSessionAction } from "../actions";
import { useToast } from "@/hooks/use-toast";

type PaymentMethodType = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

export function PaymentMethodCard() {
  const t = useTranslations('settings');
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  useEffect(() => {
    async function fetchPaymentMethod() {
      try {
        setIsLoading(true);
        const result = await getPaymentMethodAction();
        if (result.success && result.paymentMethod) {
          setPaymentMethod(result.paymentMethod);
        }
      } catch (error) {
        console.error("Error fetching payment method:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPaymentMethod();
  }, [t]);

  return (
    <div className="rounded-lg border p-4 bg-card">
      <h3 className="font-medium mb-3">{t('subscription.payment-method')}</h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">{t('subscription.loading')}</span>
        </div>
      ) : paymentMethod ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-14 bg-muted rounded mr-3 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{t('subscription.payment-method-card')}</p>
              <p className="text-xs text-muted-foreground">•••• {paymentMethod.last4}, {t('subscription.expires')} {paymentMethod.expMonth}/{paymentMethod.expYear.toString().slice(-2)}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            disabled={isRedirecting}
            onClick={async () => {
              try {
                setIsRedirecting(true);
                // Create a Stripe customer portal session and redirect
                const result = await createCustomerPortalSessionAction();
                if (result.success && result.url) {
                  window.location.href = result.url;
                } else {
                  toast({
                    title: "Erreur",
                    description: "Impossible d'accéder au portail de paiement",
                    variant: "destructive"
                  });
                  setIsRedirecting(false);
                }
              } catch (error) {
                console.error("Error redirecting to customer portal:", error);
                toast({
                  title: "Erreur",
                  description: "Une erreur est survenue",
                  variant: "destructive"
                });
                setIsRedirecting(false);
              }
            }}
          >
            {isRedirecting ? "Redirection..." : t('subscription.update-payment-method')}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t('subscription.no-payment-method')}</p>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isRedirecting}
            onClick={async () => {
              try {
                setIsRedirecting(true);
                // Create a Stripe customer portal session and redirect
                const result = await createCustomerPortalSessionAction();
                if (result.success && result.url) {
                  window.location.href = result.url;
                } else {
                  toast({
                    title: "Erreur",
                    description: "Impossible d'accéder au portail de paiement",
                    variant: "destructive"
                  });
                  setIsRedirecting(false);
                }
              } catch (error) {
                console.error("Error redirecting to customer portal:", error);
                toast({
                  title: "Erreur",
                  description: "Une erreur est survenue",
                  variant: "destructive"
                });
                setIsRedirecting(false);
              }
            }}
          >
            {isRedirecting ? "Redirection..." : t('subscription.add-payment-method')}
          </Button>
        </div>
      )}
    </div>
  );
}
