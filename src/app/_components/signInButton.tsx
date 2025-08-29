"use client"
import { signIn } from "next-auth/react";

export function GoogleSignInButton() {
  return(
    <button
      onClick={() => signIn("google")}
      className="mt-5 border rounded"
    >
      <span>Sign in with Google</span>
    </button>
  );
}