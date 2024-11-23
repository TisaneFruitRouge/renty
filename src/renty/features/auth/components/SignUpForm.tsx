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
import { signUp } from "../actions"
import Link from "next/link"
import { useRouter } from "next/navigation"

const formSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	name: z.string().min(2, "Name must be at least 2 characters"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"]
})

export default function SignUpForm() {
	const { toast } = useToast();
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const { email, password, name } = values;
			await signUp(email, password, name);
			
			await fetch('/api/email/after-sign-up', {
				method: 'POST',
				headers: {
				  'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name, email }),
			});
			
			toast({
				title: "Success",
				description: "Your account has been created",
			});
			router.push('/');
		} catch (error) {
			console.error("Form submission error", error)
			toast({
				variant: "destructive",
				title: "Error",
				description: "There was an error creating your account",
			});
		}
	}

	return (
		<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md p-6 bg-background border rounded-xl shadow-lg">
			<div className="space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
				<p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
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
								<FormDescription>This will be your login email</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Full Name</FormLabel>
								<FormControl>
									<Input 
										placeholder="John Doe"
										type="text"
										{...field} 
									/>
								</FormControl>
								<FormDescription>Your full name</FormDescription>
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
										placeholder="••••••••"
										{...field} 
									/>
								</FormControl>
								<FormDescription>At least 8 characters</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirm Password</FormLabel>
								<FormControl>
									<Input 
										type="password"
										placeholder="••••••••"
										{...field} 
									/>
								</FormControl>
								<FormDescription>Re-enter your password</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="space-y-4">
						<Button type="submit" className="w-full">Create account</Button>
						<p className="text-sm text-center text-muted-foreground">
							Already have an account?{" "}
							<Link href="/sign-in" className="text-primary hover:underline">
								Sign in
							</Link>
						</p>
					</div>
				</form>
			</Form>
		</div>
	)
}