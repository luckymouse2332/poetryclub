"use server";

import { redirect } from "next/navigation";

import { signOutCurrentSession } from "@/server/auth/session";

export async function logoutAction(): Promise<void> {
  await signOutCurrentSession();
  redirect("/");
}
