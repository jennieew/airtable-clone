import { Box, Button, Divider, IconButton, Menu, MenuItem, Select, Tab, Tabs, TextField } from "@mui/material";
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

  const handleTabClick = (e: React.MouseEvent<HTMLElement>, index: number, tableId: string) => {
    if (selectedTab === index) {
      setAnchorEl(e.currentTarget as HTMLElement);
      setMenuTableId(tableId);
    }
  };
  
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

  // with tabs
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
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
    <Box 
      sx={{
        display: "flex", 
        gap: 1, 
        alignItems: "center", 
        backgroundColor: "#eff6ff", 
        ml: "-4px",
        mt: "-4px",
        pl: "4px",
        pt: "4px",
        zIndex: 2,
      }}
    >
      <Tabs
        value={selectedTab}
        onChange={handleChange}
        aria-label="Tables"
        sx={{
          minHeight: "32px",
          height: "32px",
          minWidth: "auto",
          "& .MuiTabs-flexContainer": { height: "32px" },
          "& .MuiTab-root": {
            minHeight: "32px",
            height: "32px",
            minWidth: "auto",
            paddingY: 0,
            paddingX: "12px",
            lineHeight: "32px",
            textTransform: "none",
            backgroundColor: "#eff6ff",
            "&:first-of-type": {
              borderLeft: "none",
            },
            fontSize: "13px",
          },
          "& .MuiTab-wrapper": {
            flexDirection: "row",
            gap: 0.5,
            alignItems: "center",
          },
          "& .Mui-selected": {
            color: "#313036 !important",
            borderTopRightRadius: "4px",
            backgroundColor: "white",
            zIndex: 1,
          },
          "& .MuiTabs-indicator": { display: "none" },
        }}
      >
      {tables.map((table, index) => {
        const isSelected = selectedTab === index;
        const isNextSelected = selectedTab === index + 1;
        const isFirst = index === 0;

        return (
          <Tab
            key={table.tableId}
            value={index}
            onClick={(e) => handleTabClick(e, index, table.tableId)}
            id={`table-tab-${table.tableId}`}
            aria-controls={
              anchorEl && menuTableId === table.tableId ? "table-tab-menu" : undefined
            }
            aria-haspopup={isSelected ? "true" : undefined}
            aria-expanded={
              Boolean(anchorEl && menuTableId === table.tableId) ? "true" : undefined
            }
            disableRipple
            sx={{
              borderRight: isSelected ? "1px solid #e0e0e0" : "none",
              borderLeft: isSelected && !isFirst ? "1px solid #e0e0e0" : "none",
              backgroundColor: isSelected ? "white" : "#eff6ff",
              fontWeight: isSelected ? "bold" : "normal",
              borderTopLeftRadius: isSelected && index !== 0 ? "4px" : 0,
              borderBottom: isSelected ? "none" : "1px solid #e0e0e0",
              zIndex: isSelected ? 2 : 1,

              "&::after": !isSelected && !isNextSelected ? {
                content: '""',
                position: "absolute",
                top: "12px",
                bottom: "12px",
                right: 0,
                width: "1px",
                backgroundColor: "#e0e0e0",
              } : undefined,
            }}
            label={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {table.name}
                </span>
                {isSelected && <ExpandMoreIcon sx={{ fontSize: 16 }} />}
              </Box>
            }
          />
        );
      })}
      </Tabs>

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