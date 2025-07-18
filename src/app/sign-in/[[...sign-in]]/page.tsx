import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12 dark:from-slate-900 dark:to-slate-800">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<h1 className="font-bold text-3xl text-slate-900 tracking-tight dark:text-slate-100">
						Welcome back
					</h1>
					<p className="mt-2 text-slate-600 text-sm dark:text-slate-400">
						Sign in to your debt tracker account
					</p>
				</div>
				<div className="rounded-lg bg-white p-8 shadow-lg dark:bg-slate-800">
					<SignIn
						appearance={{
							elements: {
								formButtonPrimary:
									"bg-slate-900 hover:bg-slate-800 text-sm normal-case dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900",
								card: "shadow-none",
								headerTitle: "hidden",
								headerSubtitle: "hidden",
								socialButtonsBlockButton:
									"border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700",
								socialButtonsBlockButtonText: "font-medium",
								formFieldInput:
									"border-slate-200 focus:border-slate-400 focus:ring-slate-400 dark:border-slate-600 dark:focus:border-slate-400",
								footerActionLink:
									"text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
							},
						}}
					/>
				</div>
			</div>
		</div>
	);
}
