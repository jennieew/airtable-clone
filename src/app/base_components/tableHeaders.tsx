import { Menu, MenuItem } from "@mui/material";
import { api } from "@/utils/api";

type tableHeaderProps = {
  headerMenuAnchor: {
    columnId: string;
    anchorEl: HTMLElement;
  } | null;
  closeHeaderMenu: () => void;
  tableId: string
}

export default function TableHeader({ headerMenuAnchor, closeHeaderMenu, tableId }: tableHeaderProps) {
  const utils = api.useUtils();

  const editColumn = api.column.editColumn.useMutation({
    onMutate: async ({ columnId, name, type }) => {
      await utils.table.getTable.cancel({ tableId });

      const previousTable = utils.table.getTable.getData({ tableId });

      utils.table.getTable.setData({ tableId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          columns: old.columns.map(col =>
            col.columnId === columnId
              ? { ...col, name, type }
              : col
          ),
          rows: old.rows.map(row => ({
            ...row,
            values: row.values.filter(cell => cell.columnId !== columnId)
          }))
        }
      })

      return { previousTable };
    },
    onError: (err, variables, context) => {
      if (context?.previousTable) {
        utils.table.getTable.setData({ tableId }, context.previousTable);
      }
    },
    onSuccess: async () => {
      await utils.table.getTable.invalidate({ tableId })
    }
  });

  const deleteColumn = api.column.deleteColumn.useMutation({
    onMutate: async ({ columnId }) => {
      await utils.table.getTable.cancel({ tableId });

      const previousTable = utils.table.getTable.getData({ tableId });

      utils.table.getTable.setData({ tableId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          columns: old.columns.filter(col => col.columnId !== columnId),
          rows: old.rows.map(row => ({
            ...row,
            values: row.values.filter(cell => cell.columnId !== columnId)
          }))
        };
      });

      return { previousTable };
    },
    onError: (err, variables, context) => {
      if (context?.previousTable) {
        utils.table.getTable.setData({ tableId: tableId }, context.previousTable);
      }
    },
    onSuccess: async () => {
      await utils.table.getTable.invalidate({ tableId })
    } 
  })

  if (!headerMenuAnchor) return;

  return (
    <Menu
      anchorEl={headerMenuAnchor?.anchorEl}
      open={Boolean(headerMenuAnchor?.anchorEl)}
      onClose={closeHeaderMenu}
    >
      <MenuItem onClick={() => {
        editColumn.mutate({ columnId: headerMenuAnchor.columnId, name: "to fix", type: "STRING"});
        closeHeaderMenu(); 
      }}>
        Edit Field
      </MenuItem>
      <MenuItem onClick={() => { 
        deleteColumn.mutate({ columnId: headerMenuAnchor.columnId });
        closeHeaderMenu(); 
      }}>
        Delete
      </MenuItem>
    </Menu>
  )
}