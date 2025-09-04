import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";

export const rowRouter = createTRPCRouter({
  createRow: protectedProcedure
    .input(
      z.object({
        tableId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { tableId } = input;
      const table = await ctx.db.table.findUnique({
        where: { tableId },
      });

      if (!table) throw new Error("Table not found");

      if (table.authorId !== ctx.session.user.id) {
        throw new Error("Unauthorized to add row");
      }

      const newRow = await db.row.create({
        data: {
          authorId: ctx.session.user.id,
          tableId
        }
      });

      return newRow;
    }),

  deleteRow: protectedProcedure
    .input(
      z.object({
        rowId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { rowId } = input;

      const row = await ctx.db.row.findUnique({
        where: { rowId }
      });

      if (!row) {
        throw new Error("Row not found");
      }

      if (row.authorId !== ctx.session.user.id) {
        throw new Error("Unauthorized to delete row")
      }

      return ctx.db.row.delete({
        where: { rowId },
      })
    })
})