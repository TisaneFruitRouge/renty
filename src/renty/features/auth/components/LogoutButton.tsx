"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function LogoutButton() {
    const router = useRouter();
    const t = useTranslations('sidebar');
    const [isLoading, setIsLoading] = useState(false);

    async function signOut() {
        setIsLoading(true);
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/sign-in");
                    },
                },
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <Button 
            onClick={signOut}
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={isLoading}
        >
            {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t('logout')}
        </Button>
    )
}