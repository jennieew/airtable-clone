import type { Cell, Column, Row, Table } from "@prisma/client";
import type { UseMutationResult } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
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
  value: string | number;
  tableData: Record<string, string | number>[];
  setTableData: React.Dispatch<React.SetStateAction<Record<string, string | number>[]>>;
  table: TableWithRelations;
  editCell: ReturnType<EditCellMutation>;
};

function moveToNextCell(
  e: React.KeyboardEvent<HTMLInputElement>,
  rowIndex: number,
  colIndex: number,
  table: TableWithRelations
) {
  let nextRow = rowIndex;
  let nextCol = colIndex;

  switch (e.key) {
    case "ArrowRight":
      nextCol = colIndex + 1 < table.columns.length ? colIndex + 1 : colIndex;
      break;
    case "ArrowLeft":
      nextCol = colIndex - 1 >= 0 ? colIndex - 1 : colIndex;
      break;
    case "ArrowUp":
      nextRow = rowIndex - 1 >= 0 ? rowIndex - 1 : rowIndex;
      break;
    case "ArrowDown":
      nextRow = rowIndex + 1 < table.rows.length ? rowIndex + 1 : rowIndex;
      break;
    case "Tab":
      if (!e.shiftKey) {
        nextCol = colIndex + 1 < table.columns.length ? colIndex + 1 : colIndex;
      } else {
        nextCol = colIndex - 1 >= 0 ? colIndex - 1 : colIndex;
      }
      break;
    case "Enter":
      nextRow = rowIndex + 1 < table.rows.length ? rowIndex + 1 : rowIndex;
      break;
  }

  const nextColumn = table.columns[nextCol];
  if (!nextColumn) return;

  const nextColId = nextColumn.columnId;
  const nextInput = document.querySelector<HTMLInputElement>(
    `input[data-row='${nextRow}'][data-col='${nextColId}']`
  );
  nextInput?.focus();
  e.preventDefault();
}

// export default function TableCell({ rowIndex, columnId, colType, value, tableData, setTableData, table, editCell }: TableCellProps) {
//   const [editMode, setEditMode] = useState<"replace" | "caret">("replace");
//   const [inputValue, setInputValue] = useState(value);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const saveValue = () => {
//     const val = inputRef.current?.value ?? "";
//     setTableData(prev => {
//       const newData = [...prev];
//       const row = newData[rowIndex];
//       if (row) row[columnId] = colType === "NUMBER" ? Number(val) : val;
//       return newData;
//     });

//     const cell = table.rows[rowIndex]?.values.find(c => c.columnId === columnId);
//     if (!cell) return;

//     editCell.mutate({
//       cellId: cell.cellId,
//       stringValue: colType === "STRING" ? val : null,
//       numberValue: colType === "NUMBER" ? Number(val) : null,
//     });
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     const colIndex = table.columns.findIndex(c => c.columnId === columnId);

//     if (editMode === "replace") {
//       switch (e.key) {
//         case "ArrowRight":
//         case "ArrowLeft":
//         case "ArrowUp":
//         case "ArrowDown":
//         case "Tab":
//         case "Enter":
//           saveCellValue();
//           moveToNextCell(e, rowIndex, colIndex, table);
//           break;
//       }
//     } else if (editMode === "caret") {
//       if (e.key === "Enter") {
//         setEditMode("replace");
//         moveToNextCell(e, rowIndex, colIndex, table);
//       }
//     }
//   };

//   const saveCellValue = () => {
//     const cell = table.rows[rowIndex]?.values.find(c => c.columnId === columnId);
//     if (!cell) return;

//     // update backend
//     editCell.mutate({
//       cellId: cell.cellId,
//       stringValue: colType === "STRING" ? inputValue as string : null,
//       numberValue: colType === "NUMBER" ? inputValue as number : null,
//     });

//     // update tableData
//     setTableData(prev => {
//       const newData = [...prev];
//       const row = newData[rowIndex];
//       if (row) row[columnId] = inputValue;
//       return newData;
//     });
//   };

//   return (
//     <input
//       ref={inputRef}
//       data-row={rowIndex}
//       data-col={columnId}
//       defaultValue={value}
//       type={colType === "NUMBER" ? "number" : "text"}
//       onBlur={saveValue}
//       onKeyDown={handleKeyDown}
//     />
//   );
// }

export default function TableCell({ rowIndex, columnId, colType, value, tableData, setTableData, table, editCell }: TableCellProps) {
  const initialValue = tableData[rowIndex]?.[columnId] ?? "";
  const [cellValue, setCellValue] = useState(initialValue);

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
      onChange={(e) => {
        const val = colType === "NUMBER" ? Number(e.target.value) : e.target.value;
        setCellValue(val);

        // update local table data
        // setTableData(prev => {
        //   const newData = [...prev];
        //   const row = newData[rowIndex];
        //   if (row) row[columnId] = val;
        //   return newData;
        // });
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}
