import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { Cell, Column, Row, Table, View } from "@prisma/client";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@mui/material";
import ColumnMenu from "./columnMenu";
import { api } from "@/utils/api";
import TableHeader from "./tableHeaders";
import TableCell from "./tableCell";

type RowWithRelations = Row & { values: Cell[] };

type TableWithRelations = Table & {
  columns: Column[];
  rows: RowWithRelations[];
};

type TableComponentProps = {
  tableId: string;
  view: View;
};

export default function TableDisplay({ tableId, view }: TableComponentProps) {
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
          order: old.rows.length > 0 
            ? Math.max(...old.columns.map(c => c.order)) + 10 
            : 0,
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

  // mutation for editing cells
  const editCell = api.cell.editCell.useMutation({
    onMutate: async ({ cellId, stringValue, numberValue }) => {
      // cancel any ongoing fetch
      await utils.cell.getCell.cancel({ cellId });

      const previousCell = utils.cell.getCell.getData({ cellId });

      // optimistically update
      utils.cell.getCell.setData({ cellId }, (old) => {
        if (!old) return old;

        return {
          ...old,
          stringValue: stringValue ?? old.stringValue,
          numberValue: numberValue ?? old.numberValue,
        };
      });
      // return previous data so it can be rolled back in onError
      return { previousCell };
    },
    onError: (err, variables, context) => {
      if (context?.previousCell) {
        utils.cell.getCell.setData({ cellId: variables.cellId }, context.previousCell);
      }
    },
    onSettled: async (data, error, variables) => {
      await utils.cell.getCell.invalidate({ cellId: variables.cellId });
    },
  });

  // filters on the view!!
  
  // transform table to flat objects
  useEffect(() => {
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

    // create the columns for the tables, making them input cells
    const tableColumns = useMemo(() => {
      if (!table) return [];

      return [
        ...table.columns.map((col, colIndex) =>
          columnHelper.accessor(col.columnId, {
            header: col.name.trim() === "" ? "Label" : col.name,
            cell: (info) => {
              const value = tableData[info.row.index]?.[info.column.id] ?? "";

              return (
                <TableCell
                    rowIndex={info.row.index}
                    columnId={info.column.id}
                    colType={col.type}
                    value={value}
                    tableData={tableData}
                    setTableData={setTableData}
                    table={table}
                    editCell={editCell}
                  />
              );
            },
          })
        ),
      ];
    }, [table?.columns, tableData]);

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