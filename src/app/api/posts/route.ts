import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {

    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json(
            { error: "Not authenticated!" },
            { status: 400 }
        );
    }

    try {
        // Parse the JSON body of the request
        const body = await request.json();
        const { title, description, content, coverImage, tags, category, published } = body;

        // Validate that title is provided
        if (!body) {
            return NextResponse.json(
                { error: "Invalid or incomplete data!" },
                { status: 400 }
            );
        }


        // Generate a slug from the title
        const slug = slugify(title);

        // Create a new post in the database using Prisma
        const newPost = await prisma.post.create({
            data: {
                title,
                slug,
                description,
                content,
                author: {
                    connect: {
                        cid: userId
                    }
                },
                coverImage,
                published,
                category: {
                    connect: { id: category.id },
                },
                tags: {
                    connect: tags.map((tagId: string) => ({ id: tagId })), // Assuming tags are passed as an array of tag IDs
                },
            },
        });

        // Return a success response with the created post data
        return NextResponse.json(newPost, { status: 201 }); // 201 status for resource creation

    } catch (error) {
        console.error("Error creating post:", error);
        // Return an error response if something goes wrong
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
