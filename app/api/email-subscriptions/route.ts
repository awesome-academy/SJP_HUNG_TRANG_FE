import { NextResponse } from "next/server";

import { nextId, readMockDb, writeMockDb } from "@/lib/mock-db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    const db = await readMockDb();
    const subscriptions = Array.isArray(db.emailSubscriptions) ? db.emailSubscriptions : [];

    const existed = subscriptions.some((item) => item.email.toLowerCase() === email);
    if (existed) {
      return NextResponse.json({ message: "Email already subscribed" }, { status: 409 });
    }

    const newSubscription = {
      id: nextId(subscriptions),
      email,
    };

    db.emailSubscriptions = [...subscriptions, newSubscription];
    await writeMockDb(db);

    return NextResponse.json(newSubscription, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to subscribe email" }, { status: 500 });
  }
}
