"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    
    const router = useRouter();

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
            Logout
        </Button>
    )
}