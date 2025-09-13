import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@mui/material";
import ColumnMenu from "./columnMenu";
import { api } from "@/utils/api";
import TableHeader from "./tableHeaders";
import { TableCell } from "./tableCell";

import {
  Table as ShadTable,
  TableBody,
  TableCell as ShadCell,
  TableHead,
  TableHeader as ShadHeader,
  TableRow,
} from "@/components/ui/table";

import { useVirtualizer } from "@tanstack/react-virtual";
import type { FilterCondition, RowWithRelations, SortCondition, ViewWithFilters } from "../types";
import { LoadingTable } from "./loadingTable";

type TableComponentProps = {
  tableId: string;
  view: ViewWithFilters;
};

export default function TableDisplay({ tableId, view }: TableComponentProps) {
  const utils = api.useUtils();

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

  const { data: table, isLoading } = api.table.getTable.useQuery({ tableId });
  const [tableData, setTableData] = useState<RowWithRelations[]>([]);

  useEffect(() => {
    if (table) setTableData(table.rows);
  }, [table]);

  // const { data: sortedRows, refetch: refetchRows, isFetching: rowsLoading } = api.table.getSortedRows.useQuery(
  //   { tableId, sort: (view.sort ?? []) as unknown as SortCondition[] }, 
  //   { enabled: !!tableId }
  // );

  // useEffect(() => {
  //   if (sortedRows) setTableData(sortedRows);
  // }, [sortedRows]);

  const columnHelper = createColumnHelper<Record<string, string | number>>();

  // VIRTUALISATION
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualiser = useVirtualizer({
    count: tableData.length ?? 0,
    estimateSize: () => 32,
    // getItemSize: () => 32,
    getScrollElement: () => scrollRef.current,
  });

  // mutation for adding a row
  const addRow = api.row.createRow.useMutation({
    onMutate: async({ tableId }) => {
      await utils.table.getTable.cancel({ tableId });

      const previousTable = utils.table.getTable.getData({ tableId });
      if (!previousTable) {
        throw new Error("Cannot find table")
      }

      const tempId = crypto.randomUUID();
      const newRow = {
        rowId: tempId,
        tableId,
        authorId: previousTable.authorId,
        order: previousTable.rows.length * 10,
        values: previousTable.columns.map(col => ({
          cellId: crypto.randomUUID(),
          rowId: tempId,
          columnId: col.columnId,
          stringValue: col.type === "STRING" ? "" : null,
          numberValue: col.type === "NUMBER" ? 0 : null,
        })),
      };
        
      setTableData(prev => [...prev, newRow]);

      return { previousTable, tempId }
    },
    onError: (err, variables, context) => {
      if (context?.previousTable) {
        utils.table.getTable.setData({ tableId: variables.tableId }, context.previousTable);
      }
    },
    onSuccess: async (newRow, variables, context) => {
      await utils.table.getTable.invalidate({ tableId: variables.tableId });
      // await refetchRows();
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
      // await refetchRows();
    },
  });
  
  // transform table to flat objects
  const filteredRows = useMemo(() => {
    if (!table) return [];
    const filters = view.filters;
    return table.rows.filter(row => {
      return filters.every((filter) => {
        const cell = row.values.find(c => c.columnId === filter.column);
        if (!cell) return false;

        switch (filter.operator) {
          case "contains": return (cell.stringValue ?? "").includes(filter.value as string);
          case "does not contain": return !(cell.stringValue ?? "").includes(filter.value as string);
          case "is": return (cell.stringValue ?? cell.numberValue) === filter.value;
          case "is not": return (cell.stringValue ?? cell.numberValue) !== filter.value;
          case "is empty": return (cell.stringValue ?? cell.numberValue ?? "") === "";
          case "is not empty": return (cell.stringValue ?? cell.numberValue ?? "") !== "";
          default: return true;
        }
      });
    });
  }, [table, view.filters]);

  // only set tableData initially or when adding rows
  useEffect(() => {
    if (!table) return;

    // if there are filters, apply them, else just use table.rows
    const hasFilters = view.filters.length > 0;
    const newData = hasFilters ? filteredRows : table.rows;

    setTableData(newData);
  }, [table, filteredRows, view.filters]);
  
  // create the columns for the tables, making them input cells
  const tableColumns = useMemo(() => {
    if (!table) return [];

    return [
      ...table.columns.map((col, colIndex) =>
        columnHelper.accessor(col.columnId, {
          header: col.name.trim() === "" ? "Label" : col.name,
          cell: (info) => {
            const rowData = tableData[info.row.index];
            if (!rowData) return null;
            return (
              <TableCell
                  rowIndex={info.row.index}
                  columnId={info.column.id}
                  colType={col.type}
                  rowData={rowData}
                  setTableData={setTableData}
                  table={table}
                  editCell={editCell}
                />
            );
          },
        })
      ),
    ];
  }, [table?.columns]);
  
    // fix data to pass into tanstack table
  const flatTableData = useMemo(() => {
    return tableData.map(row => {
      const obj: Record<string, string | number> = {};
      table?.columns.forEach(col => {
        const cell = row.values.find(c => c.columnId === col.columnId);
        obj[col.columnId] = cell?.stringValue ?? cell?.numberValue ?? "";
      });
      return obj;
    });
  }, [tableData, table?.columns]);

  const tanstackTable = useReactTable({
    data: flatTableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // const CELL_STYLE = { width: "180px", minWidth: "180px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
  // const SIDE_CELL = { width: "50px", minWidth: "50px", maxWidth: "50px" };
  if (isLoading || !table) return <LoadingTable />;
  return (
    <>
      {isLoading || !table ? (
        <LoadingTable/>
      ) : (
        <div className="bg-white container" ref={scrollRef}>
          <div 
            style={{ 
              height: `${virtualiser.getTotalSize() + 61}px`,
              // flex: 1
            }}>
            <ShadTable 
              style={{ 
                tableLayout: "fixed",
                width: "100%",
              }}
            >
              <ShadHeader>
                {tanstackTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow 
                    key={headerGroup.id}
                    style={{
                      height: "32px",
                    }}
                  >
                    <TableHead style={{ 
                      width: "32px", 
                      borderRight: "none",
                      height: "32px",
                      padding: "0 8px",
                      lineHeight: "32px",
                    }}>#</TableHead>

                    {headerGroup.headers.map((header, headerIndex) => (
                      <TableHead 
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{ 
                          width: "180px",
                          borderLeft: headerIndex === 0 ? "none" : undefined,
                          paddingTop: 0,
                          paddingBottom: 0,
                          height: "32px",
                        }}
                        onClick={(e) => openHeaderMenu(e, header.column.id)}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}

                    <TableHead 
                      style={{ 
                        width: "50px",
                        paddingTop: 0,
                        paddingBottom: 0,
                        height: "32px",
                      }}
                    >
                      <Button
                        sx={{ 
                          color: "black", 
                          minHeight: "32px", 
                          height: "32px",
                          minWidth: "auto",
                        }}
                        onClick={handleOpenColumnMenu}
                      >+</Button>
                    </TableHead>
                  </TableRow>
                ))}
              </ShadHeader>

              <TableBody>
                {virtualiser.getVirtualItems().map((virtualRow, index) => {
                  const row = tanstackTable.getRowModel().rows[virtualRow.index];
                  return(
                    <TableRow
                      key={row?.id}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${
                          virtualRow.start - index * virtualRow.size
                        }px)`,
                        // position: "absolute",
                        // width: "100%",
                      }}
                    >
                      <ShadCell
                        style={{
                          borderRight: "none",
                          width: "32px",
                        }}
                      >{index + 1}</ShadCell>
                      {row?.getVisibleCells().map((cell, cellIndex) => (
                        <ShadCell 
                          key={cell.id} 
                          style={{ 
                            width: "180px",
                            borderLeft: cellIndex === 0 ? "none" : undefined,
                            padding: 0,
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </ShadCell>
                      ))}
                      <ShadCell 
                        style={{ 
                          background: "#f7f8fc",
                          border: "none",
                          borderRight: "none",
                          borderBottom: "none",
                          borderTop: "none",
                          padding: 0,
                        }}
                      ></ShadCell>
                    </TableRow>
                  )
                })}
                <TableRow onClick={() => addRow.mutate({ tableId })} >
                  <ShadCell colSpan={tanstackTable.getAllColumns().length + 1}>
                    +
                  </ShadCell>
                  <ShadCell
                    style={{ 
                      background: "#f7f8fc",
                      border: "none",
                      borderRight: "none",
                      borderBottom: "none",
                      borderTop: "none",
                    }}
                  ></ShadCell>
                </TableRow>
              </TableBody>
            </ShadTable>
          </div>

          <ColumnMenu
            openColumnMenu={Boolean(anchorEl)} 
            anchorEl={anchorEl} 
            onClose={handleCloseMenu} 
            tableId={table.tableId} 
          />

          <TableHeader headerMenuAnchor={headerMenuAnchor} closeHeaderMenu={closeHeaderMenu} tableId={tableId}></TableHeader>
        </div>
      )}
    </>
  );
}