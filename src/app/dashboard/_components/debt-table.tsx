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
import { formatPercentage } from "~/lib/utils";
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
  // Define columns with custom cell renderers
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => (
        <span className="capitalize">{info.getValue().replace("_", " ")}</span>
      ),
      enableSorting: false,
    }),
    columnHelper.accessor("balance", {
      header: "Balance",
      cell: (info) => (
        <div className="text-right">
          <span className="font-mono">{formatCurrency(info.getValue())}</span>
        </div>
      ),
      sortingFn: "basic",
      sortDescFirst: true,
    }),
    columnHelper.accessor("interestRate", {
      header: "Interest Rate",
      cell: (info) => (
        <div className="text-right">{formatPercentage(info.getValue())}</div>
      ),
      sortingFn: "basic",
      sortDescFirst: true,
    }),
    columnHelper.accessor("minimumPayment", {
      header: "Min Payment",
      cell: (info) => (
        <div className="text-right">
          <span className="font-mono">{formatCurrency(info.getValue())}</span>
        </div>
      ),
      sortingFn: "basic",
      sortDescFirst: true,
    }),
    columnHelper.accessor("dueDate", {
      header: "Due Date",
      cell: (info) => {
        const date = info.getValue();
        return (
          <div className="text-center">
            {date ? date.toLocaleDateString() : "N/A"}
          </div>
        );
      },
      sortingFn: "datetime",
      sortUndefined: "last",
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const debt = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingDebt(debt)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeletingDebtId(debt.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
  const tableSorting = table.getState().sorting;

  const tableHeaders = useMemo(() => {
    return tableHeaderGroups.map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => {
          console.log(header.column.getIsSorted());

          return (
            <TableHead
              key={header.id}
              className={`${
                header.column.getCanSort()
                  ? "hover:bg-muted/50 cursor-pointer transition-colors select-none"
                  : ""
              } ${header.id === "actions" ? "w-[50px]" : ""}`}
              onClick={header.column.getToggleSortingHandler()}
            >
              <div className="flex items-center gap-2">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                {header.column.getCanSort() && (
                  <div className="ml-2 flex items-center">
                    {header.column.getIsSorted() === "asc" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : header.column.getIsSorted() === "desc" ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                    )}
                    {header.column.getIsSorted() && (
                      <span className="text-muted-foreground ml-1 text-xs">
                        {tableSorting.findIndex(
                          (s) => s.id === header.column.id,
                        ) + 1}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </TableHead>
          );
        })}
      </TableRow>
    ));
  }, [tableHeaderGroups, tableSorting]);

  return (
    <>
      {debts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CreditCard className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No debts tracked yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding your first debt to begin tracking your progress.
          </p>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="interactive-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Debt
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>{tableHeaders}</TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
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
