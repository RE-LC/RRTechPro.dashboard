import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  // Do something with payload
  // For this guide, log payload to console
  const eventType = evt.type;

  try {
    if (eventType == "user.created") {
      const { first_name, last_name, primary_email_address_id, username } = evt.data;
  
      if (!first_name || !last_name || !primary_email_address_id || !username) {
        return new NextResponse("Incomplete Data!", { status: 400 });
      }
  
      await prisma.user.create({
        data: {
          cid: evt.data.id,
          firstname: first_name,
          lastname: last_name,
          email: primary_email_address_id,
          username: username
        }
      });
      // Optionally return a response or log the user creation success
      return new NextResponse("User Created Successfully!", { status: 201 });
    }
  
    if (eventType == "user.updated") {
      const { id, first_name, last_name, primary_email_address_id, username } = evt.data;
  
      if (!id) {
        return new NextResponse("User ID is missing!", { status: 400 });
      }
  
      await prisma.user.update({
        where: { cid: id },
        data: {
          firstname: first_name ?? undefined,
          lastname: last_name ?? undefined,
          email: primary_email_address_id ?? undefined,
          username: username ?? undefined
        }
      });
      // Optionally return a response or log the user update success
      return new NextResponse("User Updated Successfully!", { status: 200 });
    }
  
    if (eventType == "user.deleted") {
      const { id } = evt.data;
  
      if (!id) {
        return new NextResponse("User ID is missing!", { status: 400 });
      }
  
      await prisma.user.delete({
        where: { cid: id }
      });
      // Optionally return a response or log the user deletion success
      return new NextResponse("User Deleted Successfully!", { status: 200 });
    }
  
  } catch (error) {
    console.error("Error handling event:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }  

  return new Response('Webhook received', { status: 200 })
}