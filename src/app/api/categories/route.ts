import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function POST(request: NextRequest) {
    try {
        // Parse the JSON body of the request
        const body = await request.json();
        const { name, description } = body;

        // Validate that tagName is provided
        if (!name) {
            return NextResponse.json(
                { error: "Category name is required" },
                { status: 400 }
            );
        }

        // Create a new tag in the database using Prisma
        const newTag = await prisma.category.create({
            data: {
                name,
                slug: slugify(name),
                description
            },
        });

        // Return a success response with the created tag data
        return NextResponse.json(newTag, { status: 201 }); // 201 status for resource creation

    } catch (error) {
        console.error("Error creating tag:", error);
        // Return an error response if something goes wrong
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
