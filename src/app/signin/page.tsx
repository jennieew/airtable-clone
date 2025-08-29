"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="border rounded-2xl p-8 flex flex-col w-[30%]">
        <img src="/airtable-logo.png" alt="Airtable Logo" className="w-20 h-20 object-contain mb-10"/>
        <h1 className="text-2xl font-bold">
          Sign in to Airtable
        </h1>
        
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="mt-5 border rounded"
        >
          <span>Sign in with Google</span>
        </button>
      </div>
    </main>
  );
}