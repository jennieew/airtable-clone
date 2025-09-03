import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

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
                        },
                    },
                },
            });
        }),

    // create a base
    createBase: protectedProcedure.mutation(async ({ ctx }) => {
        return ctx.db.base.create({
            data: {
                authorId: ctx.session.user.id,
                tables: {
                    create: {
                        name: "Table 1",
                        columns: {
                            create: [
                                { name: "Name", type: "STRING" },
                                { name: "Notes", type: "STRING" },
                                { name: "Assignee", type: "STRING" },
                                { name: "Status", type: "STRING" },
                                { name: "Attachments", type: "STRING" },
                            ],
                        },
                        rows: {
                            create: [{}, {}, {}],
                        },
                        // fields: [],
                    },
                },
            },
            include: {
                tables: {
                    include: {
                        columns: true,
                        rows: true,
                    },
                },
            },
        });
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
            // make sure the user owns the base
            const base = await ctx.db.base.findUnique({
                where: { baseId: input.baseId },
            });

            if (!base) {
                throw new Error("Base not found");
            }

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