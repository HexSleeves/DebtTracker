import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export const StatCard: React.FC<{
	title: string;
	value: string;
	subtitle?: string;
	icon: React.ReactNode;
	trend?: "up" | "down" | "neutral";
	color?: "blue" | "green" | "red" | "amber";
	className?: string;
}> = ({
	title,
	value,
	subtitle,
	icon,
	className,
	trend = "neutral",
	color = "blue",
}) => {
	const colorConfig = {
		blue: {
			border: "border-l-primary",
			gradient: "from-primary-50/50 bg-gradient-to-br to-transparent",
			iconBg: "bg-primary/10",
			iconColor: "text-primary",
			valueColor: "text-primary",
		},
		green: {
			border: "border-l-success",
			gradient: "from-success-50/50 bg-gradient-to-br to-transparent",
			iconBg: "bg-success/10",
			iconColor: "text-success",
			valueColor: "text-success",
		},
		red: {
			border: "border-l-error",
			gradient: "from-error-50/50 bg-gradient-to-br to-transparent",
			iconBg: "bg-error/10",
			iconColor: "text-error",
			valueColor: "text-error",
		},
		amber: {
			border: "border-l-warning",
			gradient: "from-warning-50/50 bg-gradient-to-br to-transparent",
			iconBg: "bg-warning/10",
			iconColor: "text-warning",
			valueColor: "text-warning",
		},
	};

	const config = colorConfig[color];

	const getTrendIcon = () => {
		if (trend === "up") return <TrendingUp className="h-4 w-4" />;
		if (trend === "down") return <TrendingDown className="h-4 w-4" />;
		return null;
	};

	const getTrendColor = () => {
		if (trend === "up") return "text-success";
		if (trend === "down") return "text-error";
		return "text-muted-foreground";
	};

	return (
		<Card
			className={cn(
				"hover-lift border-l-4 transition-all duration-200",
				config.border,
				config.gradient,
				className,
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-sm">{title}</CardTitle>
				<div className={cn("rounded-full p-2", config.iconBg)}>
					<div className={cn("", config.iconColor)}>{icon}</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<div className={cn("font-bold text-2xl", config.valueColor)}>
						{value}
					</div>
					{trend !== "neutral" && (
						<Badge
							variant="outline"
							className={cn(
								"border-transparent text-xs",
								getTrendColor(),
								trend === "up" ? "bg-success/10" : "bg-error/10",
							)}
						>
							<div className="flex items-center gap-1">
								{getTrendIcon()}
								{trend === "up" ? "Up" : "Down"}
							</div>
						</Badge>
					)}
				</div>
				{subtitle && (
					<p className="mt-1 text-muted-foreground text-xs">{subtitle}</p>
				)}
			</CardContent>
		</Card>
	);
};
