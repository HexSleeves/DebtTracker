import * as z from "zod/v4";

export const ZGetDebtProgress = z.object({
	debtId: z.string().uuid(),
});
export type TGetDebtProgress = z.infer<typeof ZGetDebtProgress>;
