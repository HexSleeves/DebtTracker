"use client";

import { Calendar, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

export function UpcomingPayments() {
  const { data: debts, isLoading } = api.debt.getAll.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["skeleton-1", "skeleton-2", "skeleton-3"].map((skeletonId) => (
              <div
                key={skeletonId}
                className="flex animate-pulse items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200" />
                  <div>
                    <div className="mb-1 h-4 w-24 rounded bg-gray-200" />
                    <div className="h-3 w-16 rounded bg-gray-200" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-1 h-4 w-16 rounded bg-gray-200" />
                  <div className="h-3 w-12 rounded bg-gray-200" />
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

  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="text-primary h-5 w-5" />
          Upcoming Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingPayments.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">
              No payments due in the next 7 days
            </p>
          ) : (
            upcomingPayments.map((debt) => {
              // Determine status styling
              const getStatusStyling = () => {
                if (debt.isOverdue) {
                  return {
                    container: "border border-error/20 bg-error/5 hover-lift",
                    icon: "text-error",
                    text: "text-error",
                    badge: "bg-error/10 text-error",
                  };
                }
                if (debt.daysDiff === 0) {
                  return {
                    container:
                      "border border-warning/20 bg-warning/5 hover-lift",
                    icon: "text-warning",
                    text: "text-warning",
                    badge: "bg-warning/10 text-warning",
                  };
                }
                return {
                  container: "border border-info/20 bg-info/5 hover-lift",
                  icon: "text-info",
                  text: "text-info",
                  badge: "bg-info/10 text-info",
                };
              };

              const styling = getStatusStyling();

              return (
                <div
                  key={debt.id}
                  className={`flex items-center justify-between rounded-lg p-3 transition-all duration-200 ${styling.container}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${styling.badge}`}>
                      <CreditCard className={`h-4 w-4 ${styling.icon}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{debt.name}</h4>
                      <p className="text-muted-foreground text-xs capitalize">
                        {debt.type.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      $
                      {debt.minimumPayment.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className={`text-xs font-medium ${styling.text}`}>
                      {debt.isOverdue
                        ? `${Math.abs(debt.daysDiff)} day${Math.abs(debt.daysDiff) !== 1 ? "s" : ""} overdue`
                        : debt.daysDiff === 0
                          ? "Due today"
                          : `Due in ${debt.daysDiff} day${debt.daysDiff !== 1 ? "s" : ""}`}
                    </p>
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
