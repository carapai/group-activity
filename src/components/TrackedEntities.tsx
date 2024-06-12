import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DisplayInstance, ProgramTrackedEntityAttribute } from "@/interfaces";
import makeTrackerColumns from "@/lib/makeTrackerColumns";
import { useNavigate } from "@tanstack/react-router";
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { fromPairs } from "lodash";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
export default function TrackedEntities({
    programTrackedEntityAttributes,
    data,
    program,
    ou,
}: {
    programTrackedEntityAttributes: ProgramTrackedEntityAttribute[];
    data: DisplayInstance[];
    program: string;
    ou: string;
}) {
    const navigate = useNavigate({ from: "/tracker/$program/instances" });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );
    const [rowSelection, setRowSelection] = useState({});
    const [columns, setColumns] = useState(() =>
        makeTrackerColumns(
            programTrackedEntityAttributes.map(
                ({ trackedEntityAttribute: { id, name } }) => ({
                    id,
                    name,
                })
            )
        )
    );
    const [attributesMap, setAttributesMap] = useState<Record<string, string>>(
        () => {
            return fromPairs(
                programTrackedEntityAttributes.map(
                    ({ trackedEntityAttribute: { id, name } }) => [id, name]
                )
            );
        }
    );
    const [currentData, setData] = useState(() => [...data]);

    useEffect(() => {
        setColumns(() =>
            makeTrackerColumns(
                programTrackedEntityAttributes.map(
                    ({ trackedEntityAttribute: { id, name } }) => ({
                        id,
                        name,
                    })
                )
            )
        );
        setAttributesMap(() =>
            fromPairs(
                programTrackedEntityAttributes.map(
                    ({ trackedEntityAttribute: { id, name } }) => [id, name]
                )
            )
        );
        setData([...data]);
    }, [ou, program]);

    const table = useReactTable({
        data: currentData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });
    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter emails..."
                    value={
                        (table
                            .getColumn("trackedEntity")
                            ?.getFilterValue() as string) ?? ""
                    }
                    onChange={(event) =>
                        table
                            .getColumn("trackedEntity")
                            ?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="overflow-auto h-[700px]"
                    >
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value: any) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {attributesMap[column.id] || column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border overflow-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                    onClick={() =>
                                        navigate({
                                            to: "/entities",
                                            search: {
                                                tei: row.getValue<string>(
                                                    "trackedEntity"
                                                ),
                                                program: program,
                                                enrollment:
                                                    row.getValue<string>(
                                                        "firstEnrollment"
                                                    ),
                                            },
                                        })
                                    }
                                    className="cursor-pointer"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
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
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
