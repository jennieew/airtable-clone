import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { ColumnType } from "@prisma/client";

export const columnRouter = createTRPCRouter({
  createColumn: protectedProcedure
    .input(
      z.object({ 
        tableId: z.string(),
        name: z.string(),
        type: z.nativeEnum(ColumnType),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { tableId, name, type } = input;

      const table = await ctx.db.table.findUnique({
        where: { tableId },
        include: { rows: true }
      });

      if (!table) throw new Error("Table not found");

      if (table.authorId !== ctx.session.user.id) {
        throw new Error("Unauthorized to create column");
      }

      const last = await ctx.db.column.findFirst({
        where: { tableId },
        orderBy: { order: "desc" },
      })

      const newColumn = await db.column.create({
        data: {
          authorId: ctx.session.user.id,
          tableId, name, type,
          order: last ? last.order + 10 : 0
        }
      });

      // when adding a new column, create cells for each row
      if (table.rows.length > 0) {
        await ctx.db.cell.createMany({
          data: table.rows.map((row) => ({
            rowId: row.rowId,
            columnId: newColumn.columnId,
            stringValue: null,
            numberValue: null,
          })),
        });
      }

      return newColumn;
    }),

  editColumn: protectedProcedure
    .input(
      z.object({
        columnId: z.string(),
        name: z.string(),
        type: z.nativeEnum(ColumnType), 
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { columnId, name, type } = input;
      const column = await ctx.db.column.findUnique({
        where: { columnId }
      });

      if (!column) {
        throw new Error("Column not found");
      }

      if (column.authorId !== ctx.session.user.id) {
        throw new Error("Unauthorized to edit column")
      }

      return ctx.db.column.update({
        where: { columnId },
        data: { name, type }
      })
    }),
  
    deleteColumn: protectedProcedure
      .input(
        z.object({ 
          columnId: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { columnId } = input;

        const column = await ctx.db.column.findUnique({
          where: { columnId }
        });

        if (!column) {
          throw new Error("Column not found");
        }

        if (column.authorId !== ctx.session.user.id) {
          throw new Error("Unauthorized to delete column")
        }

        return ctx.db.column.delete({
          where: { columnId },
        })
      }),
})