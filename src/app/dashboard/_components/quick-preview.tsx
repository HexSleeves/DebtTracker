"use client";

import { Calendar, CreditCard, DollarSign, TrendingDown } from "lucide-react";
import { motion } from "motion/react";
import { memo, useMemo } from "react";
import { useRenderTime } from "~/components/performance-monitor";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/currency";
import { useDebtMetrics } from "~/lib/hooks/use-debt-strategy";
import { api } from "~/trpc/react";

export const DashboardQuickPreview = memo(function DashboardQuickPreview() {
  useRenderTime("DashboardQuickPreview");

  const { data: debts, isLoading } = api.debt.getAll.useQuery(undefined, {
    // Enhanced caching for dashboard data
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Memoize animation variants to prevent recreation on each render
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    }),
    [],
  );

  const cardVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1] as const,
        },
      },
    }),
    [],
  );

  // Use debt metrics hook for better calculations
  const debtMetrics = useDebtMetrics(debts ?? []);

  // Calculate upcoming payments
  const upcomingPayments = useMemo(() => {
    if (!debts) return 0;
    const today = new Date();
    return debts.filter((debt) => {
      if (!debt.dueDate) return false;
      const dueDate = new Date(debt.dueDate);
      const daysDiff = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      return daysDiff >= 0 && daysDiff <= 7;
    }).length;
  }, [debts]);

  if (isLoading) {
    return (
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {["total-debt", "minimum-payment", "interest-rate", "due-week"].map(
          (skeletonId, _index) => (
            <motion.div key={skeletonId} variants={cardVariants}>
              <Card className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                  </CardTitle>
                  <div className="h-4 w-4 rounded bg-gray-200" />
                </CardHeader>
                <CardContent>
                  <div className="mb-2 h-8 w-32 rounded bg-gray-200" />
                  <div className="h-4 w-40 rounded bg-gray-200" />
                </CardContent>
              </Card>
            </motion.div>
          ),
        )}
      </motion.div>
    );
  }

  // Determine interest rate status color
  const getInterestRateColor = (rate: number) => {
    if (rate >= 15) return "text-error";
    if (rate >= 8) return "text-warning";
    return "text-success";
  };

  // Determine payment urgency color
  const getPaymentUrgencyColor = (count: number) => {
    if (count === 0) return "text-success";
    if (count <= 2) return "text-info";
    return "text-warning";
  };

  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Total Debt */}
      <motion.div variants={cardVariants}>
        <Card className="hover-lift border-l-primary border-l-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
            <DollarSign className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-primary text-2xl font-bold">
              {formatCurrency(debtMetrics.totalDebt)}
            </div>
            <p className="text-muted-foreground text-xs">
              Across {debts?.length ?? 0} debt
              {(debts?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Minimum */}
      <motion.div variants={cardVariants}>
        <Card className="hover-lift border-l-info border-l-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Minimum
            </CardTitle>
            <CreditCard className="text-info h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-info text-2xl font-bold">
              {formatCurrency(debtMetrics.totalMinimumPayments)}
            </div>
            <p className="text-muted-foreground text-xs">
              Required monthly payment
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Average Interest Rate */}
      <motion.div variants={cardVariants}>
        <Card
          className={`hover-lift border-l-4 ${
            debtMetrics.weightedAverageInterestRate >= 15
              ? "border-l-error"
              : debtMetrics.weightedAverageInterestRate >= 8
                ? "border-l-warning"
                : "border-l-success"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Interest Rate
            </CardTitle>
            <TrendingDown
              className={`h-4 w-4 ${getInterestRateColor(
                debtMetrics.weightedAverageInterestRate,
              )}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getInterestRateColor(
                debtMetrics.weightedAverageInterestRate,
              )}`}
            >
              {debtMetrics.weightedAverageInterestRate.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">
              Weighted average APR
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Due This Week */}
      <motion.div variants={cardVariants}>
        <Card
          className={`hover-lift border-l-4 ${
            upcomingPayments === 0
              ? "border-l-success"
              : upcomingPayments <= 2
                ? "border-l-info"
                : "border-l-warning"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
            <Calendar
              className={`h-4 w-4 ${getPaymentUrgencyColor(upcomingPayments)}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getPaymentUrgencyColor(
                upcomingPayments,
              )}`}
            >
              {upcomingPayments}
            </div>
            <p className="text-muted-foreground text-xs">
              Payment{upcomingPayments !== 1 ? "s" : ""} due within 7 days
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
});
