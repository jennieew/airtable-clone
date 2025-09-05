import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";

export const viewRouter = createTRPCRouter({
  getViews: protectedProcedure
    .input(z.object({
      tableId: z.string()
    }))
    .query(({ ctx, input }) => {
      return ctx.db.view.findMany({
        where: { tableId: input.tableId }
      })
    }),

  createView: protectedProcedure
    .input(
      z.object({ 
        tableId: z.string(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const table = await ctx.db.table.findUnique({
        where: { tableId: input.tableId }
      })

      if (!table) throw new Error("Table not found");

      const session = ctx.session;
      if (!session) throw new Error("No session found");
      
      if (table.authorId !== session.user.id) {
        throw new Error("Unauthorized");
      }

      let name;
      if (!input.name) {
        if (table.viewCount === 1) {
          name = "Grid View"
        } else {
          name = `Grid ${table.viewCount + 1}`
        }
      }

      const newView = await db.view.create({
        data: {
          tableId: input.tableId,
          name: input.name ?? "Grid View",
        },
      });

      await db.table.update({
        where: { tableId: input.tableId },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });

      return newView;
    }),
})