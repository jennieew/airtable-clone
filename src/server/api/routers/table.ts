import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { ColumnType } from "@prisma/client";
import { createDefaultTable } from "./helper";

export const tableRouter = createTRPCRouter({
  createTable: protectedProcedure
    .input(z.object({ baseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { baseId } = input;
      return createDefaultTable(ctx, baseId);
    }),
  getTable: protectedProcedure
    .input(
      z.object({ tableId: z.string() })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.table.findUnique({
        where: {
          tableId: input.tableId
        },
        include: { columns: true, rows: { include: { values: true }}},
      })
    }),

  deleteTable: protectedProcedure
    .input(
      z.object({ tableId: z.string() })
    )
    .mutation(async ({ctx, input}) => {
      const table = await ctx.db.table.findUnique({
        where: { tableId: input.tableId }
      })

      if (!table) {
        throw new Error("Table not found");
      }

      if (table.authorId !== ctx.session.user.id) {
        throw new Error("Not authorized to delete this table");
      }

      await ctx.db.table.delete({
        where: { tableId: input.tableId }
      });

      return { success: true, tableId: input.tableId, baseId: table.baseId };
    }),

  renameTable: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.table.update({
        where: { tableId: input.tableId },
        data: { name: input.name }
      });
    }),
})