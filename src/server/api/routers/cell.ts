import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { ColumnType } from "@prisma/client";

export const cellRouter = createTRPCRouter({
    createCell: protectedProcedure
        .input(
            z.object({
                rowId: z.string(),
                columnId: z.string(),
                stringValue: z.string(),
                numberValue: z.number(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { rowId, columnId, stringValue, numberValue } = input;
            
            const newCell = await db.cell.create({
                data: {
                    rowId, columnId, stringValue, numberValue
                }
            });
            return newCell;
        }),
})