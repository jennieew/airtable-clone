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

    // create a base
    createBase: protectedProcedure.mutation(async ({ ctx }) => {
        return ctx.db.base.create({
            data: {
                authorId: ctx.session.user.id,
                tables: {
                    create: {
                        rows: {
                            create: [{}, {}, {}],
                        },
                        fields: [],
                    },
                },
            },
            include: {
                tables: {
                    include: {
                        rows: true,
                    },
                },
            },
        });
    }),

    // edit a base
    editBase: protectedProcedure.input(
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
});