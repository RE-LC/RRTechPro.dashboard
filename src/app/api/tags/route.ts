import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body of the request
    const body = await request.json();
    const name = body.tagName;

    // Validate that tagName is provided
    if (!name) {
      return NextResponse.json(
        { error: "tagName is required" },
        { status: 400 }
      );
    }

    // Create a new tag in the database using Prisma
    const newTag = await prisma.tag.create({
      data: {
        name: name, // Save the tag name from the request body
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
