import { Box, Button, Menu, MenuItem } from "@mui/material";
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
          }}
        >
          {table.name} <ExpandMoreIcon fontSize="small"/>
        </Button>
      ))}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          renameTable.mutate({ tableId: menuTableId, name: "to fix" });
          handleCloseMenu(); 
        }}>
          Rename
        </MenuItem>
        <MenuItem onClick={() => { 
          deleteTable.mutate({ tableId: menuTableId })
          setSelectedTab(0);
          handleCloseMenu(); 
        }}>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}