"use client";

import { AlertTriangle, Calendar, Clock, CreditCard } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/currency";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export function UpcomingPayments() {
  const { data: debts, isLoading } = api.debt.getAll.useQuery();

  if (isLoading) {
    return (
      <Card className="hover-lift">
        <CardHeader className="from-muted/50 border-b bg-gradient-to-r to-transparent">
          <CardTitle className="flex items-center gap-2">
            <div className="bg-primary/10 rounded-full p-2">
              <Calendar className="text-primary h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold">Upcoming Payments</div>
              <div className="text-muted-foreground text-sm">Next 7 days</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {["skeleton-1", "skeleton-2", "skeleton-3"].map((skeletonId) => (
              <div
                key={skeletonId}
                className="bg-muted/30 flex animate-pulse items-center justify-between rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-muted h-10 w-10 rounded-full" />
                  <div>
                    <div className="bg-muted mb-1 h-4 w-24 rounded" />
                    <div className="bg-muted h-3 w-16 rounded" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-muted mb-1 h-4 w-16 rounded" />
                  <div className="bg-muted h-3 w-12 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingPayments =
    debts
      ?.map((debt) => {
        if (!debt.dueDate) return null;
        const today = new Date();
        const dueDate = new Date(debt.dueDate);
        const daysDiff = Math.ceil(
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          ...debt,
          daysDiff,
          isOverdue: daysDiff < 0,
          isDueSoon: daysDiff >= 0 && daysDiff <= 7,
        };
      })
      .filter(
        (debt): debt is NonNullable<typeof debt> =>
          debt !== null && (debt.isOverdue || debt.isDueSoon),
      )
      .sort((a, b) => a.daysDiff - b.daysDiff)
      .slice(0, 5) ?? [];

  // Calculate summary statistics
  const totalUpcomingAmount = upcomingPayments.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0,
  );
  const overdueCount = upcomingPayments.filter((debt) => debt.isOverdue).length;
  const dueTodayCount = upcomingPayments.filter(
    (debt) => debt.daysDiff === 0,
  ).length;

  return (
    <Card className="hover-lift">
      <CardHeader className="from-muted/50 border-b bg-gradient-to-r to-transparent">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <Calendar className="text-primary h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold">Upcoming Payments</div>
              <div className="text-muted-foreground text-sm">Next 7 days</div>
            </div>
          </div>
          {upcomingPayments.length > 0 && (
            <div className="text-right">
              <div className="text-lg font-semibold">
                {formatCurrency(totalUpcomingAmount)}
              </div>
              <div className="text-muted-foreground text-sm">Total due</div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Status Summary */}
        {upcomingPayments.length > 0 && (
          <div className="mb-4 flex gap-2">
            {overdueCount > 0 && (
              <Badge className="debt-overdue">
                <AlertTriangle className="mr-1 h-3 w-3" />
                {overdueCount} Overdue
              </Badge>
            )}
            {dueTodayCount > 0 && (
              <Badge className="debt-warning">
                <Clock className="mr-1 h-3 w-3" />
                {dueTodayCount} Due Today
              </Badge>
            )}
            {upcomingPayments.length > overdueCount + dueTodayCount && (
              <Badge className="debt-current">
                <Calendar className="mr-1 h-3 w-3" />
                {upcomingPayments.length - overdueCount - dueTodayCount} This
                Week
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-3">
          {upcomingPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-success/10 mb-4 rounded-full p-4">
                <Calendar className="text-success h-8 w-8" />
              </div>
              <h3 className="text-success mb-2 text-lg font-semibold">
                All Clear!
              </h3>
              <p className="text-muted-foreground">
                No payments due in the next 7 days
              </p>
            </div>
          ) : (
            upcomingPayments.map((debt) => {
              // Enhanced status styling
              const getStatusStyling = () => {
                if (debt.isOverdue) {
                  return {
                    container:
                      "border-l-error border-l-4 bg-gradient-to-r from-error-50/50 to-transparent hover:from-error-50/70",
                    iconBg: "bg-error/10",
                    icon: "text-error",
                    text: "text-error",
                    badge: "debt-overdue",
                    urgencyIcon: AlertTriangle,
                  };
                }
                if (debt.daysDiff === 0) {
                  return {
                    container:
                      "border-l-warning border-l-4 bg-gradient-to-r from-warning-50/50 to-transparent hover:from-warning-50/70",
                    iconBg: "bg-warning/10",
                    icon: "text-warning",
                    text: "text-warning",
                    badge: "debt-warning",
                    urgencyIcon: Clock,
                  };
                }
                if (debt.daysDiff <= 3) {
                  return {
                    container:
                      "border-l-info border-l-4 bg-gradient-to-r from-info-50/50 to-transparent hover:from-info-50/70",
                    iconBg: "bg-info/10",
                    icon: "text-info",
                    text: "text-info",
                    badge: "debt-current",
                    urgencyIcon: Calendar,
                  };
                }
                return {
                  container:
                    "border-l-muted border-l-4 bg-gradient-to-r from-muted/20 to-transparent hover:from-muted/40",
                  iconBg: "bg-muted/20",
                  icon: "text-muted-foreground",
                  text: "text-muted-foreground",
                  badge: "debt-current",
                  urgencyIcon: Calendar,
                };
              };

              const styling = getStatusStyling();
              const UrgencyIcon = styling.urgencyIcon;

              return (
                <div
                  key={debt.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg p-4 transition-all duration-200",
                    styling.container,
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("rounded-lg p-2", styling.iconBg)}>
                      <CreditCard className={cn("h-5 w-5", styling.icon)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{debt.name}</h4>
                        <UrgencyIcon className={cn("h-3 w-3", styling.icon)} />
                      </div>
                      <p className="text-muted-foreground text-sm capitalize">
                        {debt.type.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(debt.minimumPayment)}
                    </p>
                    <Badge className={cn("text-xs", styling.badge)}>
                      {debt.isOverdue
                        ? `${Math.abs(debt.daysDiff)} day${Math.abs(debt.daysDiff) !== 1 ? "s" : ""} overdue`
                        : debt.daysDiff === 0
                          ? "Due today"
                          : `Due in ${debt.daysDiff} day${debt.daysDiff !== 1 ? "s" : ""}`}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
