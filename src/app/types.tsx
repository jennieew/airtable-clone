import type { Cell, Column, Row, Table, View } from "@prisma/client";

export type RowWithRelations = Row & { values: Cell[] };

export type TableWithRelations = Table & {
  columns: Column[];
  rows: RowWithRelations[];
  views: View[];
};

export const OPERATORS = ["contains", "does not contain", "is", "is not", "is empty", "is not empty"] as const;

export interface FilterCondition {
  logical?: "and" | "or" | "where";
  column: string;
  operator: typeof OPERATORS[number];
  value: string | number;
}

export type ViewWithFilters = Omit<View, "filters"> & {
  filters: FilterCondition[];
};