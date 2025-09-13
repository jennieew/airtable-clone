import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { buildPrismaFilter, createDefaultTable, type FilterCondition } from "./helper";
import type { RowWithRelations } from "@/app/types";
import { Prisma } from "@prisma/client";

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
  // getSortedRows: protectedProcedure
  //   .input(
  //     z.object({
  //       tableId: z.string(),
  //       sort: z.array(
  //         z.object({
  //           column: z.string(),
  //           direction: z.enum(["asc", "desc"]),
  //           type: z.enum(["STRING", "NUMBER"]), // need type to cast correctly
  //         })
  //       ),
  //     })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const { tableId, sort } = input;

  //     // If no sort, return all rows with their cells
  //     if (!sort || sort.length === 0) {
  //       const rows = await ctx.db.row.findMany({
  //         where: { tableId },
  //         include: { values: true },
  //       });
  //       return rows;
  //     }

  //     // Build order clauses safely
  //     const orderClauses = sort
  //       .map((s, i) => {
  //         const colParam = s.column;
  //         const dir = s.direction.toUpperCase();

  //         if (s.type === "NUMBER") {
  //           return `(SELECT c."numberValue" 
  //                    FROM "Cell" c 
  //                    WHERE c."rowId" = r."rowId" AND c."columnId" = '${colParam}') ${dir}`;
  //         } else {
  //           return `(SELECT c."stringValue" 
  //                    FROM "Cell" c 
  //                    WHERE c."rowId" = r."rowId" AND c."columnId" = '${colParam}') ${dir}`;
  //         }
  //       })
  //       .join(", ");

  //     // Fetch rows in sorted order
  //     const rows = await ctx.db.$queryRaw<RowWithRelations[]>(
  //       Prisma.sql`SELECT r.*
  //                 FROM "Row" r
  //                 WHERE r."tableId" = ${tableId}
  //                 ORDER BY ${Prisma.raw(orderClauses)};`
  //     );

  //     // Attach cells to each row
  //     const rowIds = rows.map((r) => r.rowId);
  //     const cells = await ctx.db.cell.findMany({
  //       where: { rowId: { in: rowIds } },
  //     });

  //     return rows.map((r) => ({
  //       ...r,
  //       values: cells.filter((c) => c.rowId === r.rowId),
  //     }));
  //   }),
  // .query(async ({ ctx, input }) => {
  //   const { tableId, sort } = input;

  //   if (!sort || sort.length === 0) {
  //     return ctx.db.row.findMany({
  //       where: { tableId },
  //       include: { values: true },
  //     });
  //   }

  //   const orderClauses = sort.map(
  //     s => `(SELECT c.value FROM "Cell" c WHERE c."rowId" = r."rowId" AND c."columnId" = '${s.column}') ${s.direction.toUpperCase()}`
  //   ).join(", ");

  //   const rows = await ctx.db.$queryRawUnsafe<RowWithRelations[]>(`
  //     SELECT r.*
  //     FROM "Row" r
  //     WHERE r."tableId" = '${tableId}'
  //     ORDER BY ${orderClauses}
  //   `);

  //   const rowIds = rows.map(r => r.rowId);
  //   const cells = await ctx.db.cell.findMany({
  //     where: { rowId: { in: rowIds } },
  //   });

  //   return rows.map(r => ({
  //     ...r,
  //     values: cells.filter(c => c.rowId === r.rowId),
  //   }));
  // }),
    
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