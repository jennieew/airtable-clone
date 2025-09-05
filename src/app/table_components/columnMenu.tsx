import { Button, FormControl, InputLabel, Menu, MenuItem, Select, TextField } from "@mui/material";
import { useState } from "react";
import { api } from "@/utils/api";
import { ColumnType } from "@prisma/client";

type columnMenuProps = {
  openColumnMenu: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  tableId: string;
};

export default function ColumnMenu({ openColumnMenu, anchorEl, onClose, tableId }: columnMenuProps) {
  const [type, setType] = useState<ColumnType>(ColumnType.STRING);
  const [name, setName] = useState("");

  const utils = api.useUtils();
  const createColumn = api.column.createColumn.useMutation({
    onMutate: async({ tableId, name, type}) => {
      await utils.table.getTable.cancel({ tableId });

      const previousTable = utils.table.getTable.getData({ tableId });
      const columnName = name.trim() === "" ? "Label" : name;

      const tempId = crypto.randomUUID();
      utils.table.getTable.setData({ tableId }, (old) => 
        old ? { 
          ...old,
          columns: [
            ...old.columns,
            { 
              columnId: tempId, 
              name: columnName,
              type: type as ColumnType, 
              tableId,
              authorId: old.authorId
            }
          ],
          rows: old.rows.map((row) => ({
            ...row,
            values : [
              ...row.values,
              {
                cellId: crypto.randomUUID(),
                rowId: row.rowId,
                columnId: tempId,
                stringValue: type === "STRING" ? "" : null,
                numberValue: type === "NUMBER" ? 0 : null,
              }
            ],
          })),
        }
      : old
      );
      return { previousTable, tempId };
    },
    onError: (err, variables, context) => {
      if (context?.previousTable) {
        utils.table.getTable.setData({ tableId: variables.tableId }, context.previousTable);
      }
    },
    onSuccess: async (newColumn, variables, context) => {
      await utils.table.getTable.invalidate({ tableId: variables.tableId });
      utils.table.getTable.setData({ tableId: variables.tableId }, (old) =>
        old
          ? {
              ...old,
              columns: old.columns.map((col) =>
                col.columnId === context?.tempId ? newColumn : col
              ),
            }
          : old
      );
    }
  });

  const handleCreateColumn = async () => {
    const columnName = name;
    setName("");
    onClose();
    await createColumn.mutateAsync({
      tableId, name: columnName, type,
    })
  }
  
  return(
    <Menu
      anchorEl={anchorEl}
      open={openColumnMenu}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleCreateColumn().catch(console.error);;
        }
      }}
    >
      <MenuItem disableRipple disableTouchRipple>
        <TextField
          placeholder="Field name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        ></TextField>
      </MenuItem>
      <MenuItem disableRipple disableTouchRipple>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Column Type</InputLabel>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as ColumnType)}
            label="Column Type"
          >
            <MenuItem value={ColumnType.STRING}>Text</MenuItem>
            <MenuItem value={ColumnType.NUMBER}>Number</MenuItem>
          </Select>
        </FormControl>
      </MenuItem>

      <MenuItem disableRipple disableTouchRipple>
        <Button
          onClick={onClose}
        >Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreateColumn}
        >Create field</Button>
      </MenuItem>
    </Menu>
  )
}