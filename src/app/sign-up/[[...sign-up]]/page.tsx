import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Start tracking and optimizing your debt repayment
          </p>
        </div>
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-slate-800">
          <SignUp
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
