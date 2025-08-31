import { api } from "@/trpc/react";

const CreateBase = () => {
  const { data: user } = api.user.getCurrentUser.useQuery();
  if (!user) return null;
}