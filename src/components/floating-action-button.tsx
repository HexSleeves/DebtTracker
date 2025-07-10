"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, DollarSign, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import type { TCreateDebt } from "~/routers/debt/debt.schema";
import { api } from "~/trpc/react";
import { DebtForm } from "./forms/debt-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";

interface ActionItem {
	icon: React.ReactNode;
	label: string;
	onClick?: () => void;
	href?: string;
	color: string;
}

const FloatingActionButton: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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

	const actionItems: ActionItem[] = [
		{
			icon: <CreditCard size={20} />,
			label: "Add New Debt",
			onClick: () => {
				setIsDebtDialogOpen(true);
				setIsOpen(false);
			},
			color: "bg-blue-500 hover:bg-blue-600",
		},
		{
			icon: <DollarSign size={20} />,
			label: "Log Payment",
			href: "/dashboard/payments/new",
			color: "bg-green-500 hover:bg-green-600",
		},
		{
			icon: <TrendingUp size={20} />,
			label: "View Strategies",
			href: "/dashboard/strategies",
			color: "bg-purple-500 hover:bg-purple-600",
		},
	];

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	const getActionPosition = (index: number, total: number) => {
		const radius = 80;
		const startAngle = Math.PI; // Start from left (180 degrees)
		const endAngle = Math.PI / 2; // End at right (90 degrees)
		const angle = startAngle - (index / (total - 1)) * (startAngle - endAngle);

		return {
			x: Math.cos(angle) * radius,
			y: -Math.abs(Math.sin(angle)) * radius, // Negative Y to go upward
		};
	};

	return (
		<>
			<div className="fixed right-6 bottom-6 z-50">
				{/* Action Items */}
				<AnimatePresence>
					{isOpen &&
						actionItems.map((item, index) => {
							const position = getActionPosition(index, actionItems.length);

							const ActionButton = (
								<motion.button
									className={`${item.color} relative transform rounded-full p-3 text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50`}
									onClick={() => {
										if (item.onClick) {
											item.onClick();
										}
									}}
									onMouseEnter={() => setHoveredIndex(index)}
									onMouseLeave={() => setHoveredIndex(null)}
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.95 }}
								>
									{item.icon}
								</motion.button>
							);

							return (
								<motion.div
									key={item.label}
									className="absolute"
									initial={{
										x: 0,
										y: 0,
										scale: 0,
										opacity: 0,
									}}
									animate={{
										x: position.x,
										y: position.y,
										scale: 1,
										opacity: 1,
									}}
									exit={{
										x: 0,
										y: 0,
										scale: 0,
										opacity: 0,
									}}
									transition={{
										type: "spring",
										stiffness: 260,
										damping: 20,
										delay: index * 0.05,
									}}
									style={{
										transformOrigin: "center",
										zIndex: 100 + (actionItems.length - index), // Higher z-index for leftmost buttons
									}}
								>
									{item.href ? (
										<Link href={item.href} onClick={() => setIsOpen(false)}>
											{ActionButton}
										</Link>
									) : (
										ActionButton
									)}

									{/* Tooltip */}
									<AnimatePresence>
										{hoveredIndex === index && (
											<motion.div
												className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 mb-2 transform whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1 text-sm text-white shadow-lg"
												style={{ zIndex: 9999 }}
												initial={{ opacity: 0, y: 10, scale: 0.8 }}
												animate={{ opacity: 1, y: 0, scale: 1 }}
												exit={{ opacity: 0, y: 10, scale: 0.8 }}
												transition={{
													type: "spring",
													stiffness: 400,
													damping: 25,
												}}
											>
												{item.label}
												{/* Tooltip arrow */}
												<div className="-translate-x-1/2 absolute top-full left-1/2 transform border-4 border-transparent border-t-gray-900" />
											</motion.div>
										)}
									</AnimatePresence>
								</motion.div>
							);
						})}
				</AnimatePresence>

				{/* Main FAB */}
				<motion.button
					className="relative z-10 rounded-full bg-indigo-600 p-4 text-white shadow-lg transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
					onClick={toggleMenu}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					animate={{
						rotate: isOpen ? 45 : 0,
					}}
					transition={{
						type: "spring",
						stiffness: 260,
						damping: 20,
					}}
				>
					<Plus size={24} />
				</motion.button>

				{/* Backdrop */}
				<AnimatePresence>
					{isOpen && (
						<motion.div
							className="-z-10 fixed inset-0 bg-black bg-opacity-20"
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.5 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsOpen(false)}
						/>
					)}
				</AnimatePresence>
			</div>

			{/* Add Debt Dialog */}
			<Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Add New Debt</DialogTitle>
						<DialogDescription>
							Enter the details of your debt to start tracking and optimizing
							your payments.
						</DialogDescription>
					</DialogHeader>
					<DebtForm
						onSubmit={handleCreateDebt}
						isLoading={createDebt.isPending}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default FloatingActionButton;
