"use client"

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import axios from "axios";

interface Category {
    id: string
    name: string
    description?: string | null
    posts: number
}

const API_BASE_URL = process.env.API_BASE_URL;

const DeleteCategory = ({ path }: { path: string }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Function to handle the deletion request
    async function deleteCategoryRequest() {
        try {
            await axios.delete(`/${API_BASE_URL}${path}`);
            toast.success("Category deleted successfully", { richColors: true });
            setIsDialogOpen(false); // Close the dialog after successful deletion
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Error deleting category", { richColors: true });
        }
    }

    return (
        <div>
            {/* Trigger to open the dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                    <button onClick={() => setIsDialogOpen(true)}>Delete Category</button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category
                            and remove it from our database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteCategoryRequest}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export const columns: ColumnDef<Category>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Name" />
        },
        cell: ({ row }) => row.getValue("name"),
    },
    {
        accessorKey: "description",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Description" />
        },
        cell: ({ row }) => row.getValue("description"),
    },
    {
        accessorKey: "posts",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="No. of Posts" />
        },
        cell: ({ row }) => {
            const value: number = row.getValue("posts");
            return <div>{value}</div>;
        },
    },
    {
        id: "actions", // Add an 'actions' column
        cell: ({ row }) => {
            const category = row.original; // The original data for this row (the full Category object)

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(category.id)
                                .then(() => {
                                    toast.success('Category ID copied to clipboard!', { richColors: true })
                                })
                                .catch(() => {
                                    toast.error('Failed to copy Category ID!', { richColors: true });
                                })
                        }}>
                            Copy Category ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>

                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={()=> <DeleteCategory path={`/categories/${category.id}`} />}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export const sampleCategories: Category[] = [
    {
        "id": "1a2b3c4d",
        "name": "Technology",
        "description": "All things tech, gadgets, and software.",
        "posts": 15
    },
    {
        "id": "2b3c4d5e",
        "name": "Health & Wellness",
        "description": "Articles related to fitness, health, and mental well-being.",
        "posts": 8
    },
    {
        "id": "3c4d5e6f",
        "name": "Travel",
        "description": "Explore different destinations and travel guides.",
        "posts": 22
    },
    {
        "id": "4d5e6f7g",
        "name": "Food & Cooking",
        "description": "Delicious recipes, food trends, and cooking tips.",
        "posts": 10
    },
    {
        "id": "5e6f7g8h",
        "name": "Finance",
        "description": "Articles about personal finance, investing, and economics.",
        "posts": 5
    },
    {
        "id": "6f7g8h9i",
        "name": "Lifestyle",
        "description": "Topics related to daily living, fashion, and personal growth.",
        "posts": 12
    }
]  