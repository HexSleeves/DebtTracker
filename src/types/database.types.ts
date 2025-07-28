/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	graphql_public: {
		Tables: Record<never, never>;
		Views: Record<never, never>;
		Functions: {
			graphql: {
				Args: {
					query?: string;
					extensions?: Json;
					variables?: Json;
					operationName?: string;
				};
				Returns: Json;
			};
		};
		Enums: Record<never, never>;
		CompositeTypes: Record<never, never>;
	};
	public: {
		Tables: {
			debt_milestones: {
				Row: {
					achieved_date: string;
					created_at: string;
					debt_id: string;
					description: string | null;
					id: string;
					milestone_type: string;
					milestone_value: number;
				};
				Insert: {
					achieved_date?: string;
					created_at?: string;
					debt_id: string;
					description?: string | null;
					id?: string;
					milestone_type: string;
					milestone_value: number;
				};
				Update: {
					achieved_date?: string;
					created_at?: string;
					debt_id?: string;
					description?: string | null;
					id?: string;
					milestone_type?: string;
					milestone_value?: number;
				};
				Relationships: [
					{
						foreignKeyName: "debt_milestones_debt_id_fkey";
						columns: ["debt_id"];
						isOneToOne: false;
						referencedRelation: "debts";
						referencedColumns: ["id"];
					},
				];
			};
			debts: {
				Row: {
					balance: number;
					clerk_user_id: string;
					created_at: string | null;
					due_date: string | null;
					id: string;
					interest_rate: number;
					minimum_payment: number;
					name: string;
					original_balance: number;
					paid_off_date: string | null;
					status: string;
					total_interest_paid: number;
					total_payments_made: number;
					type: string;
					updated_at: string | null;
				};
				Insert: {
					balance: number;
					clerk_user_id?: string;
					created_at?: string | null;
					due_date?: string | null;
					id?: string;
					interest_rate: number;
					minimum_payment: number;
					name: string;
					original_balance: number;
					paid_off_date?: string | null;
					status?: string;
					total_interest_paid?: number;
					total_payments_made?: number;
					type: string;
					updated_at?: string | null;
				};
				Update: {
					balance?: number;
					clerk_user_id?: string;
					created_at?: string | null;
					due_date?: string | null;
					id?: string;
					interest_rate?: number;
					minimum_payment?: number;
					name?: string;
					original_balance?: number;
					paid_off_date?: string | null;
					status?: string;
					total_interest_paid?: number;
					total_payments_made?: number;
					type?: string;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			payment_plans: {
				Row: {
					clerk_user_id: string;
					created_at: string | null;
					extra_payment: number;
					id: string;
					is_active: boolean | null;
					monthly_budget: number;
					name: string;
					strategy: string;
					target_date: string | null;
					updated_at: string | null;
				};
				Insert: {
					clerk_user_id?: string;
					created_at?: string | null;
					extra_payment?: number;
					id?: string;
					is_active?: boolean | null;
					monthly_budget: number;
					name?: string;
					strategy: string;
					target_date?: string | null;
					updated_at?: string | null;
				};
				Update: {
					clerk_user_id?: string;
					created_at?: string | null;
					extra_payment?: number;
					id?: string;
					is_active?: boolean | null;
					monthly_budget?: number;
					name?: string;
					strategy?: string;
					target_date?: string | null;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			payment_recommendations: {
				Row: {
					clerk_user_id: string;
					created_at: string;
					debt_id: string | null;
					description: string;
					expires_at: string | null;
					id: string;
					is_applied: boolean;
					priority: string;
					reasoning: string;
					recommendation_type: string;
					recommended_amount: number;
					title: string;
				};
				Insert: {
					clerk_user_id: string;
					created_at?: string;
					debt_id?: string | null;
					description: string;
					expires_at?: string | null;
					id?: string;
					is_applied?: boolean;
					priority?: string;
					reasoning: string;
					recommendation_type: string;
					recommended_amount: number;
					title: string;
				};
				Update: {
					clerk_user_id?: string;
					created_at?: string;
					debt_id?: string | null;
					description?: string;
					expires_at?: string | null;
					id?: string;
					is_applied?: boolean;
					priority?: string;
					reasoning?: string;
					recommendation_type?: string;
					recommended_amount?: number;
					title?: string;
				};
				Relationships: [
					{
						foreignKeyName: "payment_recommendations_debt_id_fkey";
						columns: ["debt_id"];
						isOneToOne: false;
						referencedRelation: "debts";
						referencedColumns: ["id"];
					},
				];
			};
			payments: {
				Row: {
					amount: number;
					balance_after_payment: number | null;
					created_at: string | null;
					debt_id: string;
					id: string;
					interest_portion: number;
					notes: string | null;
					payment_date: string;
					payment_method: string;
					principal_portion: number;
					type: string;
				};
				Insert: {
					amount: number;
					balance_after_payment?: number | null;
					created_at?: string | null;
					debt_id: string;
					id?: string;
					interest_portion?: number;
					notes?: string | null;
					payment_date: string;
					payment_method?: string;
					principal_portion?: number;
					type: string;
				};
				Update: {
					amount?: number;
					balance_after_payment?: number | null;
					created_at?: string | null;
					debt_id?: string;
					id?: string;
					interest_portion?: number;
					notes?: string | null;
					payment_date?: string;
					payment_method?: string;
					principal_portion?: number;
					type?: string;
				};
				Relationships: [
					{
						foreignKeyName: "payments_debt_id_fkey";
						columns: ["debt_id"];
						isOneToOne: false;
						referencedRelation: "debts";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: Record<never, never>;
		Functions: {
			calculate_debt_progress: {
				Args: {
					debt_id_param: string;
				};
				Returns: number;
			};
			calculate_payment_breakdown: {
				Args: {
					debt_id_param: string;
					payment_amount: number;
					payment_date?: string;
				};
				Returns: {
					interest_portion: number;
					principal_portion: number;
				}[];
			};
			detect_and_create_milestones: {
				Args: {
					debt_id_param: string;
				};
				Returns: undefined;
			};
			get_current_user_id: {
				Args: Record<PropertyKey, never>;
				Returns: string;
			};
			process_payment_and_update_debt: {
				Args: {
					debt_id_param: string;
					payment_amount: number;
					payment_date?: string;
				};
				Returns: {
					new_balance: number;
					milestones_triggered: number;
				}[];
			};
		};
		Enums: Record<never, never>;
		CompositeTypes: Record<never, never>;
	};
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof Database },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	graphql_public: {
		Enums: {},
	},
	public: {
		Enums: {},
	},
} as const;
