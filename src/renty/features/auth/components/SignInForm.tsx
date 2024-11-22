"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { signIn } from "../actions"
import Link from "next/link"
import { useRouter } from "next/navigation"

const formSchema = z.object({
	email: z.string(),
	password: z.string()
})

export default function SignInForm() {
	const { toast } = useToast()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	})

    const router = useRouter();

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const { email, password } = values;
			await signIn(email, password);
			toast({
				title: "Logged in!",
				description: "The login has been successful",
			});
            router.push("/");
		} catch (error) {
			console.error("Form submission error", error)
			toast({
				variant: "destructive",
				title: "Error",
				description: "There was an error submitting the form",
			});
		}
	}

	return (
		<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md p-6 bg-background border rounded-xl shadow-lg">
			<div className="space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
				<p className="text-sm text-muted-foreground">Enter your credentials below to sign in to your account</p>
			</div>
			
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>E-mail</FormLabel>
								<FormControl>
									<Input 
										placeholder="john.doe@gmail.com"
										type="email"
										{...field} 
									/>
								</FormControl>
								<FormDescription>The email you used to create your account</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input 
										type="password"
										{...field} 
									/>
								</FormControl>
								<FormDescription>Your password</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="space-y-4">
						<Button type="submit" className="w-full">Sign in</Button>
						<p className="text-sm text-center text-muted-foreground">
							Don&apos;t have an account?{" "}
							<Link href="/sign-up" className="text-primary hover:underline">
								Sign up
							</Link>
						</p>
					</div>
				</form>
			</Form>
		</div>
	)
}