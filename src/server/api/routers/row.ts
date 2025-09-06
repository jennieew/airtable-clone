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
        include: { columns: true }
      });

      if (!table) throw new Error("Table not found");

      if (table.authorId !== ctx.session.user.id) {
        throw new Error("Unauthorized to add row");
      }

      const last = await ctx.db.row.findFirst({
        where: { tableId },
        orderBy: { order: "desc" },
      })

      const newRow = await db.row.create({
        data: {
          authorId: ctx.session.user.id,
          tableId,
          order: last ? last.order + 10 : 0,
        },
      });

      // create cells for existing columns
      if (table.columns.length > 0) {
        await ctx.db.cell.createMany({
          data: table.columns.map((col) => ({
            rowId: newRow.rowId,
            columnId: col.columnId,
            stringValue: null,
            numberValue: null,
          })),
        });
      }

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