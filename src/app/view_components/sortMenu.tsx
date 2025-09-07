import { Button, Divider, Menu, MenuItem, Select } from "@mui/material";
import type { Cell, Column, Row, Table, View } from "@prisma/client";
import { useState } from "react";

type RowWithRelations = Row & { values: Cell[] };

type TableWithRelations = Table & {
  columns: Column[];
  rows: RowWithRelations[];
  views: View[];
};

type sortMenuProps = {
  openSortMenu: boolean;
  sortAnchor: HTMLElement | null;
  onClose: () => void;
  viewId: string;
  table: TableWithRelations;
};

export default function SortMenu({ openSortMenu, sortAnchor, onClose, viewId, table }: sortMenuProps) {
  // get view
  const [sort, setSort] = useState("");
  
  return (
    <Menu
      anchorEl={sortAnchor}
      open={openSortMenu}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            minWidth: 'auto',        // remove default min width
            width: 'max-content',    // shrink to fit content
          },
        },
      }}
    >
      <MenuItem disableRipple disableTouchRipple>Sort by</MenuItem>
      <Divider/>
      {sort === "" ? (
          table.columns.map((col) => (
            <MenuItem 
              key={col.columnId}
              onClick={() => setSort(col.name)}
            >{col.name}</MenuItem>
          ))
        ) : (
          <MenuItem disableRipple disableTouchRipple>
            <Select
              value={sort}
              sx={{ width: '100%' }}
            >
              <MenuItem>{sort}</MenuItem>
              <MenuItem>To do!</MenuItem>
            </Select>
            <Select sx={{ width: '100%' }}>
              <MenuItem>A-Z</MenuItem>
              <MenuItem>Z-A</MenuItem>
            </Select>
          </MenuItem>
        )
      }
    </Menu>
  )
}