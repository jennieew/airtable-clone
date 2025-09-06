import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import type { FilterCondition } from "./helper";

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

      const newView = await db.view.create({
        data: {
          tableId: input.tableId,
          name: input.name ?? `Grid ${table.viewCount + 1}`,
        },
      });

      await db.table.update({
        where: { tableId: input.tableId },
        data: {
          viewCount: {
            increment: 1,
          },
          viewIndex: table.viewCount,
        },
      });

      return newView;
    }),
    addFilter: protectedProcedure
      .input(z.object({
        viewId: z.string(),
        newFilter: z.object({
          logical: z.optional(z.enum(["and", "or", "where"])),
          column: z.string(),
          operator: z.string(),
          value: z.union([z.string(), z.number()]),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const view = await ctx.db.view.findUnique({
          where: { viewId: input.viewId }
        })

        if (!view) throw new Error("View not found");

        const existingFilters = ((view.filters as unknown) as FilterCondition[]) || [];
        const updatedFilters = [...existingFilters, input.newFilter];
        
        await db.view.update({
          where: { viewId: input.viewId },
          data: {
            filters: updatedFilters,
          },
        });

        return updatedFilters
      }),
})