import type { Cell, Column, Row, Table, View } from "@prisma/client";
import { memo, useEffect, useRef, useState } from "react";
import { api } from "@/utils/api";

type RowWithRelations = Row & { values: Cell[] };

type TableWithRelations = Table & {
  columns: Column[];
  rows: RowWithRelations[];
};

type EditCellMutation = typeof api.cell.editCell.useMutation;

type TableCellProps = {
  rowIndex: number;
  columnId: string;
  colType: "STRING" | "NUMBER";
  rowData: RowWithRelations;
  setTableData: React.Dispatch<React.SetStateAction<RowWithRelations[]>>;
  table: TableWithRelations;
  editCell: ReturnType<EditCellMutation>;
};

export const TableCell = memo(function TableCell({ rowIndex, columnId, colType, rowData, setTableData, table, editCell }: TableCellProps) {
  // const row = tableData[rowIndex];
  const cell = rowData?.values.find(c => c.columnId === columnId);
  const initialValue = cell?.stringValue ?? cell?.numberValue ?? "";

  const [cellValue, setCellValue] = useState(initialValue);

  useEffect(() => {
    setCellValue(initialValue);
  }, [initialValue]);

  const moveToCell = (nextRow: number, nextCol: number) => {
    const nextColumn = table.columns[nextCol];
    if (!nextColumn) return;

    const nextColId = nextColumn.columnId;
    const nextInput = document.querySelector<HTMLInputElement>(
      `input[data-row='${nextRow}'][data-col='${nextColId}']`
    );
    nextInput?.focus();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const colIndex = table.columns.findIndex(c => c.columnId === columnId);
    let nextRow = rowIndex;
    let nextCol = colIndex;

    switch (e.key) {
      case "ArrowRight":
        nextCol = colIndex + 1 < table.columns.length ? colIndex + 1 : colIndex;
        moveToCell(nextRow, nextCol);
        e.preventDefault();
        handleBlur();
        break;
      case "ArrowLeft":
        nextCol = colIndex - 1 >= 0 ? colIndex - 1 : colIndex;
        moveToCell(nextRow, nextCol);
        e.preventDefault();
        handleBlur();
        break;
      case "ArrowUp":
        nextRow = rowIndex - 1 >= 0 ? rowIndex - 1 : rowIndex;
        moveToCell(nextRow, nextCol);
        e.preventDefault();
        handleBlur();
        break;
      case "ArrowDown":
        nextRow = rowIndex + 1 < table.rows.length ? rowIndex + 1 : rowIndex;
        moveToCell(nextRow, nextCol);
        e.preventDefault();
        handleBlur();
        break;
      case "Tab":
        if (!e.shiftKey) {
          nextCol = colIndex + 1 < table.columns.length ? colIndex + 1 : colIndex;
        } else {
          nextCol = colIndex - 1 >= 0 ? colIndex - 1 : colIndex;
        }
        moveToCell(nextRow, nextCol);
        e.preventDefault();
        handleBlur();
        break;
      case "Enter":
        nextRow = rowIndex + 1 < table.rows.length ? rowIndex + 1 : rowIndex;
        moveToCell(nextRow, nextCol);
        e.preventDefault();
        handleBlur();
        break;
    }
  };

  const handleBlur = () => {    
    const cell = table.rows[rowIndex]?.values.find(c => c.columnId === columnId);
    if (!cell) return;

    // optimistic update
    setTableData(prev => {
      const newData = [...prev];
      const targetRow = newData[rowIndex];
      if (!targetRow) return prev;

      const targetCell = targetRow.values.find(c => c.columnId === columnId);
      if (!targetCell) return prev;

      if (colType === "STRING") targetCell.stringValue = cellValue as string;
      if (colType === "NUMBER") targetCell.numberValue = Number(cellValue);

      return newData;
    });

    // update database
    editCell.mutate({
      cellId: cell.cellId,
      stringValue: colType === "STRING" ? cellValue as string : null,
      numberValue: colType === "NUMBER" ? cellValue as number : null,
    });
  };
  
  return (
    <input
      data-row={rowIndex}
      data-col={columnId}
      value={cellValue}
      type={colType === "NUMBER" ? "number" : "text"}
      style={{ 
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        padding: 0,
        margin: 0,
        border: "none",
      }}
      onChange={(e) => {
        const val = colType === "NUMBER" ? Number(e.target.value) : e.target.value;
        setCellValue(val);

        // update local table data
        // setTableData(prev => {
        //   const newData = [...prev];
        //   const targetRow = newData[rowIndex];
        //   if (!targetRow) return prev;

        //   const targetCell = targetRow.values.find(c => c.columnId === columnId);
        //   if (targetCell) {
        //     if (colType === "STRING") targetCell.stringValue = val as string;
        //     if (colType === "NUMBER") targetCell.numberValue = val as number;
        //   }
        //   return newData;
        // });
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
})
