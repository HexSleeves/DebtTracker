"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import type { Debt } from "~/types";
import { DebtForm } from "../forms/debt-form";

export default function DebtEditDialog({
	debt,
	isOpen,
	onOpenChange,
}: {
	debt: Debt;
	isOpen: boolean;
	onOpenChange: (o: boolean) => void;
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Debt</DialogTitle>
				</DialogHeader>
				<DebtForm defaultValues={debt} />
			</DialogContent>
		</Dialog>
	);
}
