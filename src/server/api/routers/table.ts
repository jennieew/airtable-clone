import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { ColumnType } from "@prisma/client";

export const tableRouter = createTRPCRouter({
  createTable: protectedProcedure
    .input(
      z.object({ baseId: z.string() })
    )
    .mutation(async ({ input }) => {
      const { baseId } = input

      const count = await db.table.count({ where: { baseId } });

      const newTable = await db.table.create({
        data: {
          name: `Table ${count + 1}`,
          baseId,
        }
      })

      const defaultColumns = [
        { name: "Name", type: ColumnType.STRING },
        { name: "Notes", type: ColumnType.STRING },
        { name: "Assignee", type: ColumnType.STRING },
        { name: "Status", type: ColumnType.STRING },
        { name: "Attachments", type: ColumnType.STRING },
      ];

      const createdColumns = await Promise.all(
        defaultColumns.map((col) => {
          return db.column.create({
            data: { tableId: newTable.tableId, ...col }
          })
        })
      )

      for (let i = 0; i < 3; i++) {
        const row = await db.row.create({
          data: { tableId: newTable.tableId },
        });

        await Promise.all(
          createdColumns.map((col) => {
            db.cell.create({
              data: {
                rowId: row.rowId,
                columnId: col.columnId,
              },
            })
          })
        );
      }
      
      return newTable;
    }),
})