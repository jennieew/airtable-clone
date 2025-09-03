import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { ColumnType } from "@prisma/client";

export const tableRouter = createTRPCRouter({
  createTable: protectedProcedure
    .input(
      z.object({ baseId: z.string() })
    )
    .mutation(async ({ ctx, input }) => {
      const { baseId } = input

      const base = await ctx.db.base.findUnique({
        where: { baseId },
      });

      if (!base) throw new Error("Base not found");

      // check the owner of the base
      if (base.authorId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      const newTable = await db.table.create({
        data: {
          name: `Table ${base.tableCount + 1}`,
          authorId: ctx.session.user.id,
          baseId,
        }
      })

      await db.base.update({
        where: { baseId },
        data: {
          tableCount: {
            increment: 1,
          },
        },
      });

      const defaultColumns = [
        { name: "Name", type: ColumnType.STRING },
        { name: "Notes", type: ColumnType.STRING },
        { name: "Assignee", type: ColumnType.STRING },
        { name: "Status", type: ColumnType.STRING },
        { name: "Attachments", type: ColumnType.STRING },
      ];

      const createdColumns = await Promise.all(
        defaultColumns.map((col) => {
          return db.column.create({
            data: { tableId: newTable.tableId, ...col }
          })
        })
      )

      for (let i = 0; i < 3; i++) {
        const row = await db.row.create({
          data: { tableId: newTable.tableId },
        });

        await Promise.all(
          createdColumns.map((col) => {
            return db.cell.create({
              data: {
                rowId: row.rowId,
                columnId: col.columnId,
              },
            })
          })
        );
      }
      
      return newTable;
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
    })
})