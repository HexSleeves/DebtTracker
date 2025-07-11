"use client";

import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Info,
  TrendingUp,
  Zap,
} from "lucide-react";
import { StatCard } from "~/components/stats-card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

/**
 * Theme Showcase Component
 * Demonstrates the enhanced color system and new visual elements
 */
export function ThemeShowcase() {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-primary text-3xl font-bold">
          Enhanced Theme Showcase
        </h1>
        <p className="text-muted-foreground">
          Explore the new vibrant color system and enhanced visual elements
        </p>
      </div>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>Our enhanced semantic color system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="bg-primary flex h-20 items-center justify-center rounded-lg">
                <span className="text-primary-foreground font-medium">
                  Primary
                </span>
              </div>
              <p className="text-center text-sm">Primary Actions</p>
            </div>
            <div className="space-y-2">
              <div className="bg-success flex h-20 items-center justify-center rounded-lg">
                <span className="text-success-foreground font-medium">
                  Success
                </span>
              </div>
              <p className="text-center text-sm">Paid Debts</p>
            </div>
            <div className="space-y-2">
              <div className="bg-warning flex h-20 items-center justify-center rounded-lg">
                <span className="text-warning-foreground font-medium">
                  Warning
                </span>
              </div>
              <p className="text-center text-sm">High Interest</p>
            </div>
            <div className="space-y-2">
              <div className="bg-error flex h-20 items-center justify-center rounded-lg">
                <span className="text-error-foreground font-medium">Error</span>
              </div>
              <p className="text-center text-sm">Overdue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gradient Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Gradient Elements</CardTitle>
          <CardDescription>
            Beautiful gradients for progress and highlights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="bg-gradient-primary h-4 rounded-full" />
              <div className="bg-gradient-success h-4 rounded-full" />
              <div className="bg-gradient-warning h-4 rounded-full" />
              <div className="bg-gradient-error h-4 rounded-full" />
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-primary rounded-lg p-4">
                <p className="text-primary-foreground font-medium">
                  Primary Gradient Card
                </p>
              </div>
              <div className="bg-gradient-success rounded-lg p-4">
                <p className="text-success-foreground font-medium">
                  Success Gradient Card
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Elements</CardTitle>
          <CardDescription>
            Enhanced buttons and interactive components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button className="interactive-primary hover-lift">
              <Zap className="h-4 w-4" />
              Primary Action
            </Button>
            <Button className="interactive-success hover-lift">
              <CheckCircle className="h-4 w-4" />
              Mark as Paid
            </Button>
            <Button className="interactive-warning hover-lift">
              <AlertTriangle className="h-4 w-4" />
              High Priority
            </Button>
            <Button className="interactive-error hover-lift">
              <Info className="h-4 w-4" />
              Overdue Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Debt Status Cards</CardTitle>
          <CardDescription>
            Color-coded cards for different debt states
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Debt"
              value="$12,450"
              subtitle="3 accounts"
              icon={<CreditCard className="h-6 w-6" />}
              color="blue"
              trend="neutral"
            />
            <StatCard
              title="Paid Off"
              value="$5,200"
              subtitle="2 accounts"
              icon={<CheckCircle className="h-6 w-6" />}
              color="green"
              trend="up"
            />
            <StatCard
              title="High Interest"
              value="$3,800"
              subtitle="1 account"
              icon={<AlertTriangle className="h-6 w-6" />}
              color="amber"
              trend="down"
            />
            <StatCard
              title="Overdue"
              value="$890"
              subtitle="1 payment"
              icon={<TrendingUp className="h-6 w-6" />}
              color="red"
              trend="up"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Status Indicators</CardTitle>
          <CardDescription>
            Badges and indicators for quick status recognition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge className="debt-current">Current</Badge>
            <Badge className="debt-paid">Paid Off</Badge>
            <Badge className="debt-warning">High Interest</Badge>
            <Badge className="debt-overdue">Overdue</Badge>
            <Badge className="status-success">On Track</Badge>
            <Badge className="status-info">Info</Badge>
            <Badge className="status-warning">Warning</Badge>
            <Badge className="status-error">Critical</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Progress Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Indicators</CardTitle>
          <CardDescription>
            Enhanced progress bars with gradients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Debt Payoff Progress</span>
                <span>75%</span>
              </div>
              <div className="bg-muted h-3 overflow-hidden rounded-full">
                <div className="progress-success h-full w-3/4" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Budget</span>
                <span>60%</span>
              </div>
              <div className="bg-muted h-3 overflow-hidden rounded-full">
                <div className="progress-primary h-full w-3/5" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>High Interest Alert</span>
                <span>90%</span>
              </div>
              <div className="bg-muted h-3 overflow-hidden rounded-full">
                <div className="progress-warning h-full w-11/12" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
