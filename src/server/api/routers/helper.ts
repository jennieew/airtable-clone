import { db } from "@/server/db";
import { ColumnType, Prisma, type Column, type Row } from "@prisma/client";
import type { Context } from "@/server/api/trpc";

export const OPERATORS = ["contains", "does not contain", "is", "is not", "is empty", "is not empty"] as const;
export type Operator = typeof OPERATORS[number];
export interface FilterCondition {
  logical?: "and" | "or" | "where";
  column: string;
  operator: Operator;
  value?: string | number;
}

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
      currentView: "",
      views: {
        create: {
          name: "Grid View",
          description: "",
          hiddenFields: "",
          filters:[],
          groupBy: "",
          sort: "",
          color: "",
          rowHeight: "SHORT"
        },
      },
    },
    include: {
      views: true,
    },
  });

  await db.table.update({
    where: { tableId: newTable.tableId },
    data: { currentView: newTable.views[0]!.viewId },
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

export function buildPrismaFilter(filters: FilterCondition[]): Prisma.RowWhereInput | undefined {
  if (!filters || filters.length === 0) return undefined;

  // get the logic from the second filter, default to AND
  const lockedLogic = filters[1]?.logical ?? "and";

  const conditions = filters.map(f => mapFilterToPrisma(f));

  if (conditions.length === 1) return conditions[0]; // only "where"

  if (lockedLogic === "and") return { AND: conditions };
  return { OR: conditions };
}

export function mapFilterToPrisma(f: FilterCondition): Prisma.RowWhereInput {
  const columnField = f.column;
  const valueStr = f.value?.toString() ?? "";
  switch (f.operator) {
    case "contains":
      return { values: { some: { columnId: columnField, stringValue: { contains: valueStr } } } };
    case "does not contain":
      return { values: { none: { columnId: columnField, stringValue: { contains: valueStr } } } };
    case "is":
      return { values: { some: { columnId: columnField, stringValue: valueStr } } };
    case "is not":
      return { values: { none: { columnId: columnField, stringValue: valueStr } } };

    case "is empty":
      return {
        values: {
          some: {
            columnId: columnField,
            OR: [
              { stringValue: null },
              { stringValue: "" },
              { numberValue: null },
            ],
          },
        },
      };

    case "is not empty":
      return {
        values: {
          none: {
            columnId: columnField,
            NOT: [
              { stringValue: null },
              { stringValue: "" },
              { numberValue: null },
            ],
          },
        },
      };
  }
}