import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { GoogleSignInButton } from "./signInButton";

// import { type User, getServerSession } from 'next-auth'

// export const session = async ({ session, token }: any) => {
//   session.user.id = token.id
//   session.user.tenant = token.tenant
//   return session
// }

// export const getUserSession = async (): Promise<User> => {
//   const authUserSession = await getServerSession({
//     callbacks: {
//       session
//     }
//   })
//   if (!authUserSession) throw new Error('unauthorized')
//   return authUserSession.user
// } 

export default async function SignIn() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  // const user = await getUserSession();
  // console.log(JSON.stringify(user));

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="border rounded-2xl p-8 flex flex-col w-[30%]">
          <img src="/airtable-logo.png" alt="Airtable Logo" className="w-20 h-20 object-contain mb-10"/>
          <h1 className="text-2xl font-bold">
            Sign in to Airtable
          </h1>
          <GoogleSignInButton/>
        </div>
      </main>
    </HydrateClient>
  );
}