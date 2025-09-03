import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { Cell, Column, Row, Table } from "@prisma/client";
import React, { useState } from "react";

type RowWithRelations = Row & { values: Cell[] };

type TableWithRelations = Table & {
  columns: Column[];
  rows: RowWithRelations[];
};

type TableComponentProps = {
  table: TableWithRelations;
};

export default function TableDisplay({ table }: TableComponentProps) {
  // transform table to flat objects
  const [tableData, setTableData] = useState(() => {
    return table.rows.map((row: RowWithRelations) => {
      const rowObj: Record<string, any> = {};
      table.columns.forEach((col: Column) => {
        const cell = row.values.find((c: Cell) => c.columnId === col.columnId);
        rowObj[col.columnId] = cell?.stringValue ?? cell?.numberValue ?? "";
      });
      return rowObj;
    });
  });

  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnId: string;
    value: string;
  } | null>(null);

  const columnHelper = createColumnHelper<any>();

  const tableColumns = [
    columnHelper.display({
      id: 'rowNumber',
      header: '#',
      cell: (info) => info.row.index + 1,
    }),
    ...table.columns.map((col) =>
      columnHelper.accessor(col.columnId, {
        header: col.name,
        cell: (info) => {
          const value = info.getValue();
          return (
            <input
              value={value}
              onChange={(e) => {
                const { value } = e.target;
                setTableData((prev) => {
                  const newData = [...prev];
                  const row = { ...newData[info.row.index] }
                  row[col.columnId] = value;
                  newData[info.row.index] = row;
                  return newData;
                });
              }}
            />
          )
        }
      })
    ),
  ];

  const tanstackTable = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <table>
        <thead>
          {tanstackTable.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {tanstackTable.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}