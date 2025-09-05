import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { ColumnType } from "@prisma/client";

export const cellRouter = createTRPCRouter({
    editCell: protectedProcedure
        .input(
            z.object({
                cellId: z.string(),
                stringValue: z.string().nullable(),
                numberValue: z.number().nullable(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { cellId, stringValue, numberValue } = input;

            const cell = await ctx.db.cell.findUnique({ 
                where: { cellId } 
            });

            if (!cell) throw new Error("Cell not found");

            const row = await ctx.db.row.findUnique({
                where: { rowId: cell.rowId }
            });
            if (row?.authorId !== ctx.session.user.id) {
                throw new Error("Unauthorized to edit cell");
            }

            return ctx.db.cell.update({
                where: { cellId },
                data: {
                    stringValue,
                    numberValue,
                },
            });
        }),
    getCell: protectedProcedure
        .input(
            z.object({ cellId: z.string() })
        )
        .query(async ({ ctx, input }) => {
            return await ctx.db.cell.findUnique({
                where: { cellId: input.cellId },
            })
        }),
})