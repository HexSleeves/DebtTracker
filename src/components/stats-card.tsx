import { TrendingDown, TrendingUp } from "lucide-react";

export const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "green" | "red" | "amber";
}> = ({ title, value, subtitle, icon, trend = "neutral", color = "blue" }) => {
  const colorClasses = {
    blue: "bg-primary-50 border-primary-200 text-primary-700",
    green: "bg-success-50 border-success-100 text-success-700",
    red: "bg-error-50 border-error-100 text-error-700",
    amber: "bg-warning-50 border-warning-100 text-warning-700",
  };

  return (
    <div
      className={`rounded-lg border-2 p-6 ${colorClasses[color]} transition-theme hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium opacity-75">{title}</h3>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {subtitle && <p className="mt-1 text-sm opacity-75">{subtitle}</p>}
        </div>
        <div className="ml-4 flex items-center space-x-2">
          {icon}
          {trend === "up" && <TrendingUp className="h-4 w-4" />}
          {trend === "down" && <TrendingDown className="h-4 w-4" />}
        </div>
      </div>
    </div>
  );
};
