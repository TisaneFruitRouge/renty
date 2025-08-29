"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, LogOutIcon } from "lucide-react";
import { useState } from "react";

export default function LogoutButton({ sidebarState }: { sidebarState: 'expanded' | 'collapsed' | undefined}) {
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
            variant="destructive"
            className="w-full"
            disabled={isLoading}
        >
            {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}

            {sidebarState === 'collapsed' ? <LogOutIcon /> : t('logout')}
        </Button>
    )
}