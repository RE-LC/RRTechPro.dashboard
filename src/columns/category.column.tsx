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
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Category {
    id: string
    name: string
    description?: string | null
    posts: number
}

async function deleteCategoryRequest(id: string) {
    // Ask for confirmation before proceeding
    const isConfirmed = window.confirm("Are you sure you want to delete this category?");

    if (!isConfirmed) {
        return; 
    }

    try {
        await axios.delete(`/api/categories/${id}`);
        toast.success("Category deleted successfully", { richColors: true });
        window.location.reload();        
    } catch (error) {
        toast.error("Error deleting category", { richColors: true });
    }
}


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
                        <DropdownMenuItem onClick={() => deleteCategoryRequest(category.id)}>Delete</DropdownMenuItem>
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