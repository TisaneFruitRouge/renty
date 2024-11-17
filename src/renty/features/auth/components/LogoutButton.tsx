"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LogoutButton() {
    const router = useRouter();
    const t = useTranslations('sidebar');

    async function signOut() {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/sign-in");
                },
            },
        });
    }
    
    return (
        <Button 
            onClick={signOut}
            className="w-full"
        >
            {t('logout')}
        </Button>
    )
}