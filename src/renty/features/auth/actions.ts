"use server";

export const signUp = async (email: string, password: string, name: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
        throw new Error("Failed to sign up");
    }
}
