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
      });

      if (!table) throw new Error("Table not found");

      if (table.authorId !== ctx.session.user.id) {
        throw new Error("Unauthorized to create column");
      }

      const newColumn = await db.column.create({
        data: {
          authorId: ctx.session.user.id,
          tableId, name, type,
        }
      });

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