import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  getCurrentUser: publicProcedure.query(({ ctx }) => {
    return ctx.session?.user;
  })
})