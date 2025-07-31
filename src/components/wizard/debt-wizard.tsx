"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import DebtDialog from "../dialogs/debt-dialog";

export default function DebtWizard() {
	const [open, setOpen] = useState(false);

	return (
		<div>
			<Button onClick={() => setOpen(true)}>Add Debt</Button>
			<DebtDialog isOpen={open} onOpenChangeAction={setOpen} />
		</div>
	);
}
