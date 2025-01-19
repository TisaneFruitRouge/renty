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
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

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
	const t = useTranslations('auth.signUp');

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
				title: t('toast.success.title'),
				description: t('toast.success.description'),
			});
			router.push('/');
		} catch (error) {
			console.error("Form submission error", error)
			toast({
				variant: "destructive",
				title: t('toast.error.title'),
				description: t('toast.error.description'),
			});
		}
	}

	return (
		<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md p-6 bg-background border rounded-xl shadow-lg">
			<div className="space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
				<p className="text-sm text-muted-foreground">{t('subtitle')}</p>
			</div>
			
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('email.label')}</FormLabel>
								<FormControl>
									<Input 
										placeholder={t('email.placeholder')}
										type="email"
										{...field} 
									/>
								</FormControl>
								<FormDescription>{t('email.description')}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('name.label')}</FormLabel>
								<FormControl>
									<Input 
										placeholder={t('name.placeholder')}
										type="text"
										{...field} 
									/>
								</FormControl>
								<FormDescription>{t('name.description')}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('password.label')}</FormLabel>
								<FormControl>
									<Input 
										type="password"
										placeholder={t('password.placeholder')}
										{...field} 
									/>
								</FormControl>
								<FormDescription>{t('password.description')}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('confirmPassword.label')}</FormLabel>
								<FormControl>
									<Input 
										type="password"
										placeholder={t('confirmPassword.placeholder')}
										{...field} 
									/>
								</FormControl>
								<FormDescription>{t('confirmPassword.description')}</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="space-y-4">
						<Button disabled={form.formState.isSubmitting} type="submit" className="w-full">
							{form.formState.isSubmitting && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{t('submit')}
						</Button>
						<p className="text-sm text-center text-muted-foreground">
							{t('haveAccount')}{" "}
							<Link href="/sign-in" className="text-primary hover:underline">
								{t('signInLink')}
							</Link>
						</p>
					</div>
				</form>
			</Form>
		</div>
	)
}