"use client";

import * as z from "zod";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";

// Form validation schema
const formSchema = z.object({
    name: z
        .string()
        .nonempty({ message: "Category cannot be empty!" })
        .min(1, { message: "Category must be at least 10 characters." })
        .max(100, { message: "Category must be within 100 characters." }),
    description: z
        .string()
        .max(200, { message: "Description must be within 200 characters." })
        .optional()
});

type CategoryFormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
    initialData?: Category
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
    const [, setLoading] = useState(false);
    const router = useRouter();

    const toastMessage = initialData ? 'Category sucessfully updated!' : 'Category sucessfully created!';
    const action = initialData ? 'Save changes' : 'Create';

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
        mode: "onSubmit",
    });

    async function onSubmit(values: CategoryFormValues) {
        setLoading(true)

        try {
            if (initialData) {
                await axios.post(`/api/categories/${initialData.id}`, values)
            } else {
                await axios.post(`/api/categories`, values)
            }

            router.back();
            router.refresh();
            toast.success(`${toastMessage}`, { richColors: true });
        } catch (error) {
            toast.error('Something went wrong while submitting the form.');
            console.error('Error during submission:', error);
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white rounded-lg w-full">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="name" className="text-lg font-medium">Category Name</FormLabel>
                            <FormControl>
                                <Input
                                    id="name"
                                    placeholder="Enter a category"
                                    {...field}
                                    className="w-full border-gray-300 focus:ring-2 focus:ring-indigo-600"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel htmlFor="description" className="text-lg font-medium">Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    id="description"
                                    placeholder="Enter a description"
                                    {...field}
                                    className="w-full border-gray-300 focus:ring-2 focus:ring-indigo-600"
                                />
                            </FormControl>
                            <FormDescription>Provide a brief description (max 200 characters).</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {action}
                </Button>
            </form>
        </Form >
    );
}
