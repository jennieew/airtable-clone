import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { ColumnType, Prisma } from "@prisma/client";
import { buildPrismaFilter, createDefaultTable, type FilterCondition } from "./helper";

const isCompleteFilter = (f: FilterCondition): boolean => {
  // must have a column and operator always
  if (!f.column || !f.operator) return false;

  // make sure value not empty
  if (f.operator !== "is empty" && f.operator !== "is not empty") {
    return f.value !== "" && f.value !== undefined && f.value !== null;
  }

  return true;
};

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
      const table = await ctx.db.table.findUnique({
        where: { tableId: input.tableId },
        include: {
          columns: true,
          rows: { include: { values: true } },
          views: true,
        },
      });

      if (!table) throw new Error("Table not found");

      const currentView = table.views.find(v => v.viewId === table.currentView) ?? table.views[0];
      if (!currentView) throw new Error("View not found!");

      const allFilters: FilterCondition[] = Array.isArray(currentView.filters)
        ? (currentView.filters as unknown as FilterCondition[])
        : [];

      const validFilters = allFilters.filter(isCompleteFilter);

      if (validFilters.length === 0) {
        return table;
      }

      const rows = await ctx.db.row.findMany({
        where: validFilters.length
          ? buildPrismaFilter(validFilters)!
          : { tableId: table.tableId }, // if no valid filters, just display all rows
        include: { values: true },
      });

      return {
        ...table,
        rows,
        activeView: currentView,
      }
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