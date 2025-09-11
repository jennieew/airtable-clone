import { Box, Button, Divider, Menu, MenuItem, Select, TextField } from "@mui/material";
import { useState } from "react";
import { api } from "@/utils/api";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type TableTabsProps = {
  tables: { tableId: string; name: string }[];
  selectedTab: number;
  setSelectedTab: (index: number) => void;
  baseId: string;
};

export default function TableTabs({ tables, selectedTab, setSelectedTab, baseId }: TableTabsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTableId, setMenuTableId] = useState("");

  const [renameAnchorEl, setRenameAnchorEl] = useState<null | HTMLElement>(null);
  const [tableName, setTableName] = useState<string>("");

  const handleTabClick = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (selectedTab === index && tables[index]) {
      setAnchorEl(event.currentTarget); 
      setMenuTableId(tables[index].tableId);
    } else {
      setSelectedTab(index);
      setAnchorEl(null);
      setMenuTableId("");
    }
  }
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuTableId("");
  };

  const handleCloseRenameMenu = () => {
    setRenameAnchorEl(null);
  }

  const handleSaveName = () => {
    renameTable.mutate({ tableId: menuTableId, name: tableName });
    setRenameAnchorEl(null);
  }

  const utils = api.useUtils();
  const deleteTable = api.table.deleteTable.useMutation({
    onMutate: async ({ tableId }) => {
      await utils.base.getBase.cancel({ baseId });
      await utils.table.getTable.cancel({ tableId });

      const previousBase = utils.base.getBase.getData({ baseId });

      utils.base.getBase.setData({ baseId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          tables: old.tables.filter((t) => t.tableId !== tableId),
        };
      });

      return { previousBase };
    },
    onError: (err, variables, context) => {
      if (context?.previousBase) {
        utils.base.getBase.setData({ baseId }, context.previousBase);
      }
    },
    onSettled: async () => {
      await utils.base.getBase.invalidate({ baseId });
    }
  });

  const renameTable = api.table.renameTable.useMutation({
    onMutate: async ({ tableId, name }) => {
      await utils.base.getBase.cancel({ baseId });
      await utils.table.getTable.cancel({ tableId });

      const previousBase = utils.base.getBase.getData({ baseId });

      utils.base.getBase.setData({ baseId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          tables: old.tables.map((t) =>
            t.tableId === tableId ? { ...t, name } : t
          ),
        };
      });

      return { previousBase };
    },
    onError: (err, variables, context) => {
      if (context?.previousBase) {
        utils.base.getBase.setData({ baseId }, context.previousBase);
      }
    },
    onSettled: async () => {
      await utils.base.getBase.invalidate({ baseId: baseId })
    }
  });

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center"}}>
      {tables.map((table, index) => (
        <Button
          key={table.tableId}
          variant={selectedTab === index ? "contained" : "outlined"}
          onClick={(e) => handleTabClick(index, e)}
          sx={{
            borderRadius: 0,
            borderBottom: selectedTab === index ? 2 : 0,
            borderLeft: 0,
            borderRight: 0,
            borderTop: 0,
            borderColor: "black",
            color: selectedTab === index ? "black" : "#50586f",
            backgroundColor: "transparent",
            fontWeight: selectedTab === index ? "bold" : "normal",
            textTransform: "none",
            height: "36px",
          }}
        >
          {table.name} <ExpandMoreIcon fontSize="small"/>
        </Button>
      ))}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        autoFocus={false}
        disableAutoFocusItem
        anchorOrigin={{ // for shifting menu left and down
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          mt: 1.1,
        }}
        slotProps={{
          list: {
            sx: {
              padding: 0,
            }
          },
          paper: {
            sx: {
              padding: "16px",
              borderRadius: 2,
              width: 330,
              maxHeight: "432px",
              fontSize: "13px",
            },
          }
        }}
      >
        <MenuItem sx={{ fontSize: "13px" }}>Import data</MenuItem>

        <Divider/>

        <MenuItem 
          onClick={(e) => {
            const selectedTable = tables.find(t => t.tableId === menuTableId);
            if (selectedTable) {
              setTableName(selectedTable.name);
            }
            setRenameAnchorEl(e.currentTarget);
            setAnchorEl(null);
          }}
          sx={{ fontSize: "13px" }}
        >
          Rename table
        </MenuItem>
        <MenuItem sx={{ fontSize: "13px" }}>Hide table</MenuItem>
        <MenuItem sx={{ fontSize: "13px" }}>Manage fields</MenuItem>
        <MenuItem sx={{ fontSize: "13px" }}>Duplicate table</MenuItem>

        <Divider/>

        <MenuItem sx={{ fontSize: "13px" }}>Configure data dependencies</MenuItem>

        <Divider/>

        <MenuItem sx={{ fontSize: "13px" }}>Edit table description</MenuItem>
        <MenuItem sx={{ fontSize: "13px" }}>Edit table permissions</MenuItem>

        <Divider/>

        <MenuItem sx={{ fontSize: "13px" }}>Clear data</MenuItem>

        <MenuItem
          sx={{ fontSize: "13px" }}
          disabled={tables.length === 1}
          onClick={() => {
            deleteTable.mutate({ tableId: menuTableId })
            setSelectedTab(0);
            handleCloseMenu();
          }}
        >
          Delete table
        </MenuItem>
      </Menu>

      <Menu
        open={Boolean(renameAnchorEl)}
        anchorEl={renameAnchorEl}
        onClose={handleCloseRenameMenu}
        autoFocus={false}
        disableAutoFocusItem
      >
        <MenuItem>
          <TextField
            fullWidth
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
        </MenuItem>
        <MenuItem>What should each record be called?</MenuItem>
        <MenuItem>
          <Select>
            <MenuItem>Record</MenuItem>
            <MenuItem>Project</MenuItem>
            <MenuItem>Task</MenuItem>
            <MenuItem>Event</MenuItem>
          </Select>
        </MenuItem>
        <MenuItem>
          <Button onClick={() => setRenameAnchorEl(null)}>Cancel</Button>
          <Button onClick={handleSaveName}>Save</Button>
        </MenuItem>
      </Menu>
    </Box>
  );
}