"use client";

import { signIn } from "next-auth/react";
import { Button } from "@mui/material";

export default function SignIn() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="border rounded-2xl p-8 flex flex-col w-[30%]">
        <img src="/airtable-logo.png" alt="Airtable Logo" className="w-20 h-20 object-contain mb-10"/>
        <h1 className="text-2xl font-bold">
          Sign in to Airtable
        </h1>
        
        <Button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="mt-5 border rounded"
          variant="outlined"
          sx={{
            mt: 5, 
            color:"black",
            borderColor: "black",
          }}
        >
          <span>Sign in with Google</span>
        </Button>
      </div>
    </main>
  );
}