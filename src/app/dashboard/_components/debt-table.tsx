"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CreditCard,
  Edit,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo } from "react";
import { DashboardCardSkeleton } from "~/components/suspense-wrapper";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatCurrency } from "~/lib/currency";
import {
  cn,
  formatPercentage,
  getBalanceColor,
  getDebtRowColor,
  getDebtStatus,
  getDebtStatusColor,
  getDebtStatusLabel,
  getInterestRateColor,
} from "~/lib/utils";
import type { Debt } from "~/types/db.helpers";

export function DebtTableSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {["skel-1", "skel-2", "skel-3", "skel-4"].map((skel) => (
        <DashboardCardSkeleton key={skel} />
      ))}
    </div>
  );
}

// Create column helper for type safety
const columnHelper = createColumnHelper<Debt>();

export function DebtTable({
  debts,
  setIsAddDialogOpen,
  setEditingDebt,
  setDeletingDebtId,
}: {
  debts: Debt[];
  setIsAddDialogOpen: (open: boolean) => void;
  setEditingDebt: (debt: Debt) => void;
  setDeletingDebtId: (id: string) => void;
}) {
  // Define columns with enhanced styling and status indicators
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => {
        const debt = info.row.original;
        const status = getDebtStatus(debt);
        const statusColor = getDebtStatusColor(status);
        const statusLabel = getDebtStatusLabel(status);

        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{info.getValue()}</span>
            <Badge className={cn("w-fit text-xs", statusColor)}>
              {statusLabel}
            </Badge>
          </div>
        );
      },
      sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => (
        <Badge variant="outline" className="capitalize">
          {info.getValue().replace("_", " ")}
        </Badge>
      ),
      enableSorting: false,
    }),
    columnHelper.accessor("balance", {
      header: "Balance",
      cell: (info) => {
        const balance = info.getValue();
        const colorClass = getBalanceColor(balance);
        return (
          <div className="text-center">
            <span className={cn("font-mono font-medium", colorClass)}>
              {formatCurrency(balance)}
            </span>
          </div>
        );
      },
      sortingFn: "basic",
      sortDescFirst: true,
      size: -1,
      minSize: -1,
      maxSize: -1,
    }),
    columnHelper.accessor("interestRate", {
      header: "Interest Rate",
      cell: (info) => {
        const rate = info.getValue();
        const colorClass = getInterestRateColor(rate);
        return (
          <div className="text-center">
            <span className={cn("font-mono", colorClass)}>
              {formatPercentage(rate)}
            </span>
          </div>
        );
      },
      sortingFn: "basic",
      sortDescFirst: true,
      size: -1,
      minSize: -1,
      maxSize: -1,
    }),
    columnHelper.accessor("minimumPayment", {
      header: "Min Payment",
      cell: (info) => (
        <div className="text-center">
          <span className="text-muted-foreground font-mono">
            {formatCurrency(info.getValue())}
          </span>
        </div>
      ),
      sortingFn: "basic",
      sortDescFirst: true,
      size: -1,
      minSize: -1,
      maxSize: -1,
    }),
    columnHelper.accessor("dueDate", {
      header: "Due Date",
      cell: (info) => {
        const date = info.getValue();
        const isOverdue = date && date < new Date();

        return (
          <div className="text-center">
            <span
              className={cn(
                "text-sm",
                isOverdue
                  ? "text-error font-semibold"
                  : "text-muted-foreground",
              )}
            >
              {date ? date.toLocaleDateString() : "-"}
            </span>
            {isOverdue && <div className="text-error text-xs">Overdue</div>}
          </div>
        );
      },
      sortingFn: "datetime",
      sortUndefined: "last",
      size: -1,
      minSize: -1,
      maxSize: -1,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-center"></div>,
      cell: ({ row }) => {
        const debt = row.original;
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover-lift">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setEditingDebt(debt)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Debt
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeletingDebtId(debt.id)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Debt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableSorting: false,
    }),
  ];

  // Create table instance
  const table = useReactTable({
    columns,
    data: debts,
    enableSorting: true,
    enableSortingRemoval: false,
    enableMultiSort: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const tableHeaderGroups = table.getHeaderGroups();
  const tableHeaders = useMemo(() => {
    return tableHeaderGroups.map((headerGroup) => (
      <TableRow key={headerGroup.id} className="border-b-2">
        {headerGroup.headers.map((header) => {
          return (
            <TableHead
              key={header.id}
              className={cn(
                "text-foreground font-semibold",
                header.column.getCanSort()
                  ? "hover:bg-muted/50 cursor-pointer transition-colors select-none"
                  : "",
                header.id === "actions" ? "w-[50px]" : "",
              )}
              onClick={header.column.getToggleSortingHandler()}
            >
              <div
                className={cn(
                  "flex items-center gap-2",
                  header.column.getSize() === -1 && "justify-center",
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                {header.column.getCanSort() && (
                  <div className="flex items-center">
                    {header.column.getIsSorted() === "asc" ? (
                      <ArrowUp className="text-primary h-4 w-4" />
                    ) : header.column.getIsSorted() === "desc" ? (
                      <ArrowDown className="text-primary h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    )}
                  </div>
                )}
              </div>
            </TableHead>
          );
        })}
      </TableRow>
    ));
  }, [tableHeaderGroups]);

  return (
    <>
      {debts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-gradient-primary mb-6 rounded-full p-4">
            <CreditCard className="text-primary-foreground h-12 w-12" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No debts tracked yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start by adding your first debt to begin tracking your progress and
            take control of your finances.
          </p>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="interactive-primary hover-lift"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Your First Debt
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">{tableHeaders}</TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const debt = row.original;
                  const rowColorClass = getDebtRowColor(debt);

                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "hover:bg-muted/50 transition-colors",
                        rowColorClass,
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-muted-foreground h-24 text-center"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
