import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract tag ID from URL params
    const { id } = await params;
    // Parse the request body
    const body = await request.json();
    const name = body.tagName;

    // If no name is provided, return an empty response with status 400 (Bad Request)
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Update the tag in the database using Prisma
    const updatedTag = await prisma.tag.update({
      where: {
        id: id,  // Use the ID from the URL params
      },
      data: {
        name: name, // Set the new tag name
      },
    });

    // Return a success response with the updated tag data
    return NextResponse.json(updatedTag);

  } catch (error) {
    console.error("Error updating tag:", error);
    // Return an error response if something goes wrong
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the tag ID from the URL parameters
    const { id } = await params;

    // Attempt to delete the tag from the database
    const deletedTag = await prisma.tag.delete({
      where: {
        id: id, // Match the tag ID in the database
      },
    });

    // Return a success response with the deleted tag's data
    return NextResponse.json(deletedTag, { status: 200 });

  } catch (error) {
    console.error("Error deleting tag:", error);
    // If the tag does not exist or there's another error, return an error response
    return NextResponse.json(
      { error: "Tag not found or something went wrong" },
      { status: 404 } // 404 status if the tag doesn't exist
    );
  }
}