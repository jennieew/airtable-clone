import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { createDefaultTable } from "./helper";

export const baseRouter = createTRPCRouter({
    // fetch the bases for the currently signed in user
    getUserBases: protectedProcedure.query(({ ctx }) => {
        return ctx.db.base.findMany({
            where: {
                authorId: ctx.session.user.id
            },
        });
    }),

    getBase: protectedProcedure
        .input(z.object({ baseId: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.base.findUnique({
                where: {
                    baseId: input.baseId,
                    authorId: ctx.session.user.id,
                },
                include: {
                    tables: {
                        include: {
                            columns: true,
                            rows: {
                                include: {
                                    values: true,
                                }
                            },
                            views: true,
                        },
                    },
                },
            });
        }),

    // create a base
    createBase: protectedProcedure.mutation(async ({ ctx }) => {
        const newBase = await ctx.db.base.create({
            data: {
                authorId: ctx.session.user.id,
            },
        });
        
        await createDefaultTable(ctx, newBase.baseId);
        return newBase;
    }),

    // edit a base
    editBase: protectedProcedure
        .input(
            z.object({
                baseId: z.string(),
                name: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const base = await ctx.db.base.findUnique({
                where: { baseId: input.baseId }
            });
            
            if (!base) {
                throw new Error("Base not found");
            }

            if (base.authorId !== ctx.session.user.id) {
                throw new Error("Unauthorized to edit base")
            }

            return ctx.db.base.update({
                where: { baseId: input.baseId },
                data: { name: input.name },
            });
        }),

    deleteBase: protectedProcedure
        .input(
            z.object({
                baseId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const base = await ctx.db.base.findUnique({
                where: { baseId: input.baseId },
            });

            if (!base) {
                throw new Error("Base not found");
            }
            
            // make sure the user owns the base
            if (base.authorId !== ctx.session.user.id) {
                throw new Error("Not authorized to delete this base");
            }

            // Delete the base (will cascade to tables + rows if you set onDelete: Cascade)
            await ctx.db.base.delete({
                where: { baseId: input.baseId },
            });

            return { success: true };
        }),
});