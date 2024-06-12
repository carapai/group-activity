import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EventColumns, EventDisplay } from "@/interfaces";
import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export default function makeEventColumns(
    attributes: Array<{ id: string; name: string }>
) {
    const columnHelper = createColumnHelper<EventDisplay>();
    const normalColumns: EventColumns[] = [
        "event",
        "status",
        "program",
        "programStage",
        "enrollment",
        "trackedEntity",
        "orgUnit",
        "orgUnitName",
        "occurredAt",
        "scheduledAt",
        "storedBy",
        "followup",
        "deleted",
        "createdAt",
        "updatedAt",
        "attributeOptionCombo",
        "attributeCategoryOptions",
        "completedBy",
        "completedAt",
        // "assignedUser",
        // "createdBy",
        // "updatedBy",
    ];
    const normal = normalColumns.map((c) => {
        // if (c === "trackedEntity") {
        //     return columnHelper.accessor("trackedEntity", {
        //         id: "trackedEntity",
        //         cell: ({ row }) => (
        //             <Checkbox
        //                 checked={row.getIsSelected()}
        //                 onCheckedChange={(value) => row.toggleSelected(!!value)}
        //                 aria-label="Select row"
        //             >
        //                 {row.getValue("trackedEntity")}
        //             </Checkbox>
        //         ),
        //         header: ({ table }) => (
        //             <Checkbox
        //                 checked={
        //                     table.getIsAllPageRowsSelected() ||
        //                     (table.getIsSomePageRowsSelected() &&
        //                         "indeterminate")
        //                 }
        //                 onCheckedChange={(value) =>
        //                     table.toggleAllPageRowsSelected(!!value)
        //                 }
        //                 aria-label="Tracked Entity"
        //             />
        //         ),
        //         enableSorting: false,
        //         enableHiding: false,
        //     });
        // }

        return columnHelper.accessor(c, {
            id: c,
            cell: ({ row }) => <div>{row.getValue(c)}</div>,
            enableResizing: true,
            header: ({ column }) => (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        {c}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
        });
    });

    const attributeColumns = attributes.map(({ name, id }) =>
        columnHelper.accessor(({ values }) => values[id], {
            id: id,
            enableResizing: true,
            header: ({ column }) => (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        {name}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
        })
    );
    return [
        ...normal,
        ...attributeColumns,
        columnHelper.accessor(() => "actions", {
            id: "actions",
            size: 50,
            maxSize: 50,
            header: () => <div className="w-8">Actions</div>,
            cell: () => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {/* <DropdownMenuItem
                                onClick={() =>
                                    navigator.clipboard.writeText(payment.id)
                                }
                            >
                                Copy payment ID
                            </DropdownMenuItem> */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>View customer</DropdownMenuItem>
                            <DropdownMenuItem>
                                View payment details
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ];
}
