import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { OPERATORS, type FilterCondition } from "./helper";
import type { Prisma } from "@prisma/client";
import type { SortCondition } from "@/app/types";

const FilterConditionSchema = z.object({
  column: z.string(),
  operator: z.enum(OPERATORS),
  value: z.union([z.string(), z.number()]).optional(),
  logical: z.enum(["where", "and", "or"]).optional(),
});

const SortConditionSchema = z.object({
  column: z.string(),
  direction: z.enum(["asc", "desc"]),
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
      const sort = z.array(SortConditionSchema).parse(view.sort ?? []);

      return {
        ...view,
        filters,
        sort,
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
        },
      });

      return newView;
    }),

  addOrUpdateFilter: protectedProcedure
    .input(z.object({
      viewId: z.string(),
      index: z.number().optional(),
      newFilter: z.object({
        logical: z.optional(z.enum(["and", "or", "where"])),
        column: z.string(),
        operator: z.enum(OPERATORS),
        value: z.union([z.string(), z.number()]).optional(),
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

    deleteFilter: protectedProcedure
      .input(z.object({
        viewId: z.string(),
        index: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const view = await ctx.db.view.findUnique({
          where: { viewId: input.viewId }
        });

        if (!view) throw new Error("View not found");

        const filters = (view.filters as unknown as FilterCondition[]) || [];
        const updatedFilters = filters.filter((_, i) => i !== input.index);

        if (input.index === 0 && updatedFilters[0]) {
          updatedFilters[0] = { ...updatedFilters[0], logical: "where" };
        }

        return await ctx.db.view.update({
          where: { viewId: input.viewId },
          data: {
            filters: updatedFilters as unknown as Prisma.InputJsonArray[],
          },
        });
      }),

  addOrUpdateSort: protectedProcedure
    .input(z.object({
      viewId: z.string(),
      index: z.number().optional(),
      newSort: z.object({
        column: z.string(),
        direction: z.enum(["asc", "desc"]),
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const view = await ctx.db.view.findUnique({
        where: { viewId: input.viewId }
      });

      if (!view) throw new Error("View not found");

      const existingSorts = (view.sort as unknown as SortCondition[]) || [];
      let updatedSort: SortCondition[];

      if (typeof input.index === "number") {
        // update at index
        updatedSort = existingSorts.map((f, i) =>
          i === input.index ? input.newSort : f
        );
      } else {
        // add new sort
        updatedSort = [...existingSorts, input.newSort];
      }

      await ctx.db.view.update({
        where: { viewId: input.viewId },
        data: { sort: updatedSort as unknown as Prisma.InputJsonArray[], },
      });

      return updatedSort;
    }),
    deleteSort: protectedProcedure
      .input(z.object({
        viewId: z.string(),
        index: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const view = await ctx.db.view.findUnique({
          where: { viewId: input.viewId }
        });

        if (!view) throw new Error("View not found");

        const sort = (view.sort as unknown as SortCondition[]) || [];
        const updatedSort = sort.filter((_, i) => i !== input.index);

        // if (input.index === 0 && updatedSort[0]) {
        //   updatedSort[0] = { ...updatedSort[0], logical: "where" };
        // }

        return await ctx.db.view.update({
          where: { viewId: input.viewId },
          data: {
            sort: updatedSort as unknown as Prisma.InputJsonArray[],
          },
        });
      }),
})