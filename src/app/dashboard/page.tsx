"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  // const { data: session, status } = useSession();
  // const router = useRouter();

  // useEffect(() => {
  //   if (status === "loading") return;
  //   if (!session) router.push("/signin");
  // }, [session, status, router]);

  // if (status === "loading" || !session) return <div>Loading...</div>;

  // return (
  //   <div className="p-8">
  //     <h1 className="text-3xl font-bold">Dashboard</h1>
  //     <p>Welcome, {session.user?.name}!</p>
  //   </div>
  // );
  return (
    <div>
      <h1>dashboard page!!!</h1>
    </div>
  )
}