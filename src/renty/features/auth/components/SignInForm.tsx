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
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
	email: z.string(),
	password: z.string()
})

export default function SignInForm() {
	const { toast } = useToast()
	const t = useTranslations('auth.signIn')

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	})

    const router = useRouter();

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const { email, password } = values;
			await signIn(email, password);
			toast({
				title: t('toast.success.title'),
				description: t('toast.success.description'),
			});
            router.push("/");
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
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('password.label')}</FormLabel>
								<FormControl>
									<Input 
										type="password"
										{...field} 
									/>
								</FormControl>
								<FormDescription>{t('password.description')}</FormDescription>
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
							{t('noAccount')}{" "}
							<Link href="/sign-up" className="text-primary hover:underline">
								{t('signUpLink')}
							</Link>
						</p>
					</div>
				</form>
			</Form>
		</div>
	)
}