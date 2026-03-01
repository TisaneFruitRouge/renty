"use server";

import { auth } from "@/lib/auth";

export const signUp = async (email: string, password: string, name: string) => {
    await auth.api.signUpEmail({
        body: {
            email,
            password, 
            name
        }
    });
}