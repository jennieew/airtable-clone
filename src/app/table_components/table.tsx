import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { Cell, Column, Row, Table } from "@prisma/client";
import React, { useMemo, useState } from "react";
import { Button } from "@mui/material";
import ColumnMenu from "../base_components/columnMenu";
import { api } from "@/utils/api";
import TableHeader from "./tableHeaders";

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

  const handleOpenColumnMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // for renaming/deleting columns
  const [headerMenuAnchor, setHeaderMenuAnchor] = useState<{
    columnId: string;
    anchorEl: HTMLElement;
  } | null>(null);

  const openHeaderMenu = (event: React.MouseEvent<HTMLElement>, columnId: string) => {
    setHeaderMenuAnchor({ columnId, anchorEl: event.currentTarget });
  };

  const closeHeaderMenu = () => setHeaderMenuAnchor(null);

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
        // columnHelper.display({ id: 'rowNumber', header: '#', cell: (info) => info.row.index + 1 }),
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

  // mutation for adding a row
  const utils = api.useUtils();
  const addRow = api.row.createRow.useMutation({
    onMutate: async({ tableId }) => {
      await utils.table.getTable.cancel({ tableId });

      const previousTable = utils.table.getTable.getData({ tableId });
      if (!previousTable) {
        throw new Error("Cannot find table")
      }

      const tempId = crypto.randomUUID();
      utils.table.getTable.setData({ tableId }, (old) => {
        if (!old) return old;
        const newRow: RowWithRelations = {
          rowId: tempId,
          authorId: previousTable.authorId,
          tableId,
          values: old.columns.map(col => ({
            cellId: crypto.randomUUID(),
            rowId: tempId,
            columnId: col.columnId,
            stringValue: col.type === "STRING" ? "" : null,
            numberValue: col.type === "NUMBER" ? 0 : null,
          })),
        };

        return {
          ...old,
          rows: [...old.rows, newRow],
        };
      });

      return { previousTable, tempId }
    },
    onError: (err, variables, context) => {
      if (context?.previousTable) {
        utils.table.getTable.setData({ tableId: variables.tableId }, context.previousTable);
      }
    },
    onSuccess: async (newRow, variables, context) => {
      await utils.table.getTable.invalidate({ tableId: variables.tableId });
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !table) return <div>Table not found</div>;

  return (
    <div>
      <table>
        <thead>
          {tanstackTable.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              <th>#</th>
              {headerGroup.headers.map((header) => (
                <th 
                  key={header.id}
                  onClick={(e) => openHeaderMenu(e, header.column.id)}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
              <th>
                <Button
                sx={{color: "black"}}
                  onClick={handleOpenColumnMenu}
                >+</Button>
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
              <td>{rowIndex + 1}</td>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          <tr onClick={() => addRow.mutate({ tableId })} >
            <td colSpan={tanstackTable.getAllColumns().length + 1}>
              +
            </td>
          </tr>
        </tbody>
      </table>

      <TableHeader headerMenuAnchor={headerMenuAnchor} closeHeaderMenu={closeHeaderMenu} tableId={tableId}></TableHeader>
    </div>
  );
}