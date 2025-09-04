import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { Cell, Column, Row, Table } from "@prisma/client";
import React, { useMemo, useState } from "react";
import { Button } from "@mui/material";
import ColumnMenu from "./columnMenu";
import { api } from "@/utils/api";

type RowWithRelations = Row & { values: Cell[] };

type TableWithRelations = Table & {
  columns: Column[];
  rows: RowWithRelations[];
};

type TableComponentProps = {
  tableId: string;
};

export default function TableDisplay({ tableId }: TableComponentProps) {
  // for creating a new column
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const { data: table, isLoading, isError } = api.table.getTable.useQuery({ tableId });
  const [tableData, setTableData] = useState<Record<string, string | number>[]>([]);
  const columnHelper = createColumnHelper<Record<string, string | number>>();
  // transform table to flat objects
  React.useEffect(() => {
      if (table) {
        setTableData(
          table.rows.map((row) => {
            const rowObj: Record<string, string | number> = {};
            table.columns.forEach((col) => {
              const cell = row.values.find((c) => c.columnId === col.columnId);
              rowObj[col.columnId] = cell?.stringValue ?? cell?.numberValue ?? "";
            });
            return rowObj;
          })
        );
      }
    }, [table]);

    const tableColumns = useMemo(() => {
      if (!table) return [];
      return [
        columnHelper.display({ id: 'rowNumber', header: '#', cell: (info) => info.row.index + 1 }),
        ...table.columns.map((col) =>
          columnHelper.accessor(col.columnId, {
            header: col.name.trim() === "" ? "Label" : col.name,
            cell: (info) => {
              const value = info.getValue();
              return (
                <input
                  value={value || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTableData((prev) => {
                      const newData = [...prev];
                      const row = newData[info.row.index];
                      if (row) {
                        row[col.columnId] = val;
                      }
                      return newData;
                    });
                  }}
                />
              );
            },
          })
        ),
      ];
    }, [table?.columns]);

  const tanstackTable = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !table) return <div>Table not found</div>;

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
              <th>
                <Button onClick={handleOpenMenu}>+</Button>
              </th>
            </tr>
          ))}
        </thead>

        <ColumnMenu 
          openColumnMenu={Boolean(anchorEl)} 
          anchorEl={anchorEl} 
          onClose={handleCloseMenu} 
          tableId={table.tableId} 
        />
        
        <tbody>
          {tanstackTable.getRowModel().rows.map((row, rowIndex) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          <tr
            onClick={() => console.log("to fix")}
          >
            <td colSpan={tanstackTable.getAllColumns().length}>
              +
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}