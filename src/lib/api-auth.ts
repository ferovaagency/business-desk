import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function requireUser(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) {
    throw new Error("UNAUTHORIZED");
  }
  return adminAuth.verifyIdToken(token);
}
