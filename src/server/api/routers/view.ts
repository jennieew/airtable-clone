import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { OPERATORS, type FilterCondition } from "./helper";
import type { Prisma } from "@prisma/client";

const FilterConditionSchema = z.object({
  column: z.string(),
  operator: z.enum(OPERATORS),
  value: z.union([z.string(), z.number()]).optional(),
  logical: z.enum(["where", "and", "or"]).optional(),
});

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

  getView: protectedProcedure
    .input(z.object({
      viewId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const view = await ctx.db.view.findUnique({
        where: { viewId: input.viewId }
      })
      if (!view) throw new Error("View not found");

      const filters = z.array(FilterConditionSchema).parse(view.filters ?? []);

      return {
        ...view,
        filters,
      };
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
          filters: [],
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
  addOrUpdateFilter: protectedProcedure
    .input(z.object({
      viewId: z.string(),
      index: z.number().optional(), // if provided, update at this index
      newFilter: z.object({
        logical: z.optional(z.enum(["and", "or", "where"])),
        column: z.string(),
        operator: z.enum(OPERATORS),
        value: z.union([z.string(), z.number()]),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const view = await ctx.db.view.findUnique({
        where: { viewId: input.viewId }
      });

      if (!view) throw new Error("View not found");

      const existingFilters = (view.filters as unknown as FilterCondition[]) || [];
      let updatedFilters: FilterCondition[];

      if (typeof input.index === "number") {
        // update at index
        updatedFilters = existingFilters.map((f, i) =>
          i === input.index ? input.newFilter : f
        );
      } else {
        // add new filter
        updatedFilters = [...existingFilters, input.newFilter];
      }

      await ctx.db.view.update({
        where: { viewId: input.viewId },
        data: { filters: updatedFilters as unknown as Prisma.InputJsonArray[], },
      });

      return updatedFilters;
    }),
})