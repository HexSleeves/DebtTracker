import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  Shield,
  TrendingDown,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { SiteConfig } from "~/config/site";

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      {/* Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <DollarSign className="text-primary h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                {SiteConfig.title}
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Future: Add navigation menu */}
            </div>
            <nav className="flex items-center">
              <Button asChild>
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto py-24 md:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <Badge variant="secondary" className="mx-auto w-fit lg:mx-0">
                ✨ Smart Debt Management
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Take Control of Your{" "}
                <span className="text-primary">Debt Journey</span>
              </h1>
              <p className="text-muted-foreground mx-auto max-w-[600px] text-xl lg:mx-0">
                {SiteConfig.description}. Track, optimize, and eliminate debt
                with intelligent strategies tailored to your financial goals.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-4 min-[400px]:flex-row lg:justify-start">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Start Managing Debt
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
            <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-4 text-sm lg:justify-start lg:gap-8">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Free to use
              </div>
              <div className="flex items-center">
                <Shield className="mr-2 h-4 w-4 text-blue-600" />
                Secure & Private
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-purple-600" />
                Trusted by thousands
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative">
            <div className="from-primary/20 to-secondary/20 absolute inset-0 bg-gradient-to-r blur-3xl" />
            <div className="bg-card relative rounded-xl border p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Dashboard Preview</h3>
                <Badge variant="outline">Live Data</Badge>
              </div>

              {/* Mock Dashboard Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Total Debt
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$24,750</div>
                    <p className="text-muted-foreground text-xs">
                      Across 4 debts
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Monthly Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$1,245</div>
                    <p className="text-muted-foreground text-xs">
                      Required minimum
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Debt-Free Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Mar 2027</div>
                    <p className="text-muted-foreground text-xs">
                      With current plan
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Interest Saved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$3,420</div>
                    <p className="text-muted-foreground text-xs">
                      With optimization
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Become Debt-Free
            </h2>
            <p className="text-muted-foreground mx-auto max-w-[700px] text-lg">
              Powerful tools and proven strategies to help you take control of
              your finances and achieve financial freedom.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="from-card to-muted/20 border-0 bg-gradient-to-br">
              <CardHeader>
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <BarChart3 className="text-primary h-6 w-6" />
                </div>
                <CardTitle>Smart Debt Tracking</CardTitle>
                <CardDescription>
                  Organize all your debts in one place with automatic
                  calculations and progress tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="from-card to-muted/20 border-0 bg-gradient-to-br">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Optimization Strategies</CardTitle>
                <CardDescription>
                  Choose between Debt Avalanche, Snowball, or create custom
                  repayment plans.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="from-card to-muted/20 border-0 bg-gradient-to-br">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <TrendingDown className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Interest Savings</CardTitle>
                <CardDescription>
                  See exactly how much interest you'll save with optimized
                  payment strategies.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="from-card to-muted/20 border-0 bg-gradient-to-br">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Payment Reminders</CardTitle>
                <CardDescription>
                  Never miss a payment with smart notifications and due date
                  tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="from-card to-muted/20 border-0 bg-gradient-to-br">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Multiple Debt Types</CardTitle>
                <CardDescription>
                  Track credit cards, loans, mortgages, and any other debt with
                  flexible categories.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="from-card to-muted/20 border-0 bg-gradient-to-br">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your financial data is encrypted and stored securely. We never
                  share your information.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Take Control of Your Debt?
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of users who have successfully managed their debt
              with our platform. Start your journey to financial freedom today.
            </p>
            <div className="flex flex-col gap-4 min-[400px]:flex-row min-[400px]:justify-center">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t">
        <div className="container mx-auto py-8 md:py-12">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <DollarSign className="text-primary h-5 w-5" />
              <span className="font-bold">{SiteConfig.title}</span>
            </div>
            <p className="text-muted-foreground text-center text-sm md:text-left">
              © 2025 {SiteConfig.title}. Built with care for your financial
              future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
