"use client";

import { CreditCard, DollarSign, Plus, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { DebtForm } from "~/components/forms/debt-form";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import type { TCreateDebt } from "~/routers/debt/debt.schema";
import { api } from "~/trpc/react";

export function QuickActions() {
	const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);
	const utils = api.useUtils();

	const createDebt = api.debt.create.useMutation({
		onSuccess: () => {
			setIsDebtDialogOpen(false);
			void utils.debt.getAll.invalidate();
		},
	});

	const handleCreateDebt = (data: TCreateDebt) => {
		createDebt.mutate(data);
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, x: -20 },
		visible: {
			opacity: 1,
			x: 0,
			transition: {
				duration: 0.3,
				ease: [0.4, 0, 0.2, 1] as const,
			},
		},
	};

	return (
		<motion.div initial="hidden" animate="visible" variants={containerVariants}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Plus className="h-5 w-5" />
						Quick Actions
					</CardTitle>
				</CardHeader>
				<CardContent>
					<motion.div className="grid gap-3" variants={containerVariants}>
						<motion.div variants={itemVariants}>
							<Dialog
								open={isDebtDialogOpen}
								onOpenChange={setIsDebtDialogOpen}
							>
								<DialogTrigger asChild>
									<motion.div
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Button className="w-full justify-start" variant="outline">
											<CreditCard className="mr-2 h-4 w-4" />
											Add New Debt
										</Button>
									</motion.div>
								</DialogTrigger>
								<DialogContent className="max-w-md">
									<DialogHeader>
										<DialogTitle>Add New Debt</DialogTitle>
										<DialogDescription>
											Enter the details of your debt to start tracking and
											optimizing your payments.
										</DialogDescription>
									</DialogHeader>
									<DebtForm
										onSubmit={handleCreateDebt}
										isLoading={createDebt.isPending}
									/>
								</DialogContent>
							</Dialog>
						</motion.div>

						<motion.div variants={itemVariants}>
							<Link href="/dashboard/payments/new">
								<motion.div
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<Button className="w-full justify-start" variant="outline">
										<DollarSign className="mr-2 h-4 w-4" />
										Log Payment
									</Button>
								</motion.div>
							</Link>
						</motion.div>

						<motion.div variants={itemVariants}>
							<Link href="/dashboard/strategies">
								<motion.div
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<Button className="w-full justify-start" variant="outline">
										<TrendingUp className="mr-2 h-4 w-4" />
										View Payment Strategies
									</Button>
								</motion.div>
							</Link>
						</motion.div>
					</motion.div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
