import { db } from "@/server/db";
import { ColumnType, type Column, type Row } from "@prisma/client";
import type { Context } from "@/server/api/trpc";

export async function createDefaultTable(ctx: Context, baseId: string) {
  const base = await ctx.db.base.findUnique({
    where: { baseId },
  });

  if (!base) throw new Error("Base not found");

  const session = ctx.session;
  if (!session) throw new Error("No session found");

  // check the owner of the base
  if (base.authorId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const newTable = await db.table.create({
    data: {
      name: `Table ${base.tableCount + 1}`,
      authorId: session.user.id,
      baseId,
      views: {
        create: {
          name: "Grid View",
        },
      },
    },
    include: {
      views: true,
    },
  });

  // increment table count
  await db.base.update({
    where: { baseId },
    data: {
      tableCount: {
        increment: 1,
      },
    },
  });

  // create columns
  const defaultColumns = [
    { name: "Name", type: ColumnType.STRING },
    { name: "Notes", type: ColumnType.STRING },
    { name: "Assignee", type: ColumnType.STRING },
    { name: "Status", type: ColumnType.STRING },
    { name: "Attachments", type: ColumnType.STRING },
  ].map((col) => ({ ...col, tableId: newTable.tableId, authorId: session.user.id }));
  await ctx.db.column.createMany({ data: defaultColumns });

  // create rows
  const rowData = Array.from({ length: 3 }, () => ({
    tableId: newTable.tableId,
    authorId: session.user.id,
  }));
  await ctx.db.row.createMany({ data: rowData, skipDuplicates: true });

  const rows = await ctx.db.row.findMany({ where: { tableId: newTable.tableId } });
  const columns = await ctx.db.column.findMany({ where: { tableId: newTable.tableId } });

  // create cells
  const cellData = rows.flatMap((row: Row) =>
    columns.map((col: Column) => ({
      rowId: row.rowId,
      columnId: col.columnId,
      stringValue: null,
      numberValue: null,
    }))
  );
  await ctx.db.cell.createMany({ data: cellData });

  return newTable;
}