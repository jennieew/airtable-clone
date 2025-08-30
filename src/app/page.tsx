// import Link from "next/link";

// import { LatestPost } from "@/app/_components/post";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();
  console.log("Server session:", JSON.stringify(session, null, 2));

  // if there is a user, redirect to dashboard
  if (session?.user) {
    void api.post.getLatest.prefetch();
    redirect("/home");
  } else {
    // otherwise go to sign in page
    redirect("/signin");
  }
}
