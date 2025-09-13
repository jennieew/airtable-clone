import { Box, Button, Drawer, Menu, MenuItem, MenuList, TextField } from "@mui/material";
import { api } from "@/utils/api";
import AddIcon from '@mui/icons-material/Add';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import type { TableWithRelations } from "../types";
import { useEffect, useState } from "react";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';

interface SideBarProps {
  openSidebar: boolean;
  setOpenSideBar: (open: boolean) => void;
  hovered: boolean;
  setHovered: (open: boolean) => void;
  table: TableWithRelations | undefined;
  currentViewId: string;
  setCurrentViewId: React.Dispatch<React.SetStateAction<string>>;
}

export default function TableSideBar({ openSidebar, setOpenSideBar, hovered, setHovered, table, currentViewId, setCurrentViewId }: SideBarProps) {
    const toggleSidebar = () => setOpenSideBar(!openSidebar);
    const isOpen = openSidebar || hovered;
    const utils = api.useUtils();

    const [viewList, setViewList] = useState(table?.views ?? []);

    const [hoveredView, setHoveredView] = useState(false);
    const [viewAnchorEl, setViewAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        setViewList(table?.views ?? []);
    }, [table]);

    if (!table) return null;

    const createView = api.view.createView.useMutation({
        onMutate: async ({ name }) => {
            const previousTable = utils.table.getTable.getData({ tableId: table.tableId });

            const tempId = crypto.randomUUID();
            const newViewTemp = {
                viewId: tempId,
                tableId: table.tableId,
                name: name ?? `Grid ${table.viewCount + 1}`,
                description: "",
                hiddenFields: "",
                filters: [],
                groupBy: "",
                sort: [],
                color: "",
                rowHeight: "SHORT" as const,
            };

            utils.table.getTable.setData({ tableId: table.tableId }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    views: [...(old.views || []), newViewTemp],
                };
            });

            setViewList(prev => [...prev, newViewTemp]);
            setCurrentViewId(tempId);
            
            return { previousTable, tempId };
        },
        onError: (err, variables, context) => {
            if (context?.previousTable) {
                utils.table.getTable.setData({ tableId: table.tableId }, context.previousTable);
            }
        },
        onSuccess: async (newView, variables, context) => {
            if (context?.tempId) {
                setViewList(prev =>
                    prev.map(v => (v.viewId === context.tempId ? newView : v))
                );
                setCurrentViewId(newView.viewId);
            }
            await utils.table.getTable.invalidate({ tableId: table.tableId });
        },
    })

    const handleSelectView = (viewId: string) => {
        if (currentViewId === viewId) return;
        const selected = table?.views.find(v => v.viewId === viewId);
        if (!selected) return;
        setCurrentViewId(viewId);
    };

    return (
        <Drawer
            open={isOpen}
            onClose={toggleSidebar}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            variant="permanent"
            sx={{
                width: isOpen ? "280px" : "0px",
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: isOpen ? "280px" : "0px",
                    boxSizing: "border-box",
                    position: "relative",
                    overflowX: "hidden",
                    py: "10px",
                    px: isOpen ? "8px" : "0px",
                },
            }}
        >
            <Button
                onClick={() => createView.mutate({ tableId: table.tableId })} 
                sx={{ textTransform: "none", color: "black", justifyContent: "start", height: "32px", }}
            >
                <AddIcon sx={{ fontSize: "13px", mr: 1, color: "#45454a" }}/>
                Create new...
            </Button>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    height: "32px",
                    gap: 1,
                    px: 1,
                }}
            >
                <SearchOutlinedIcon sx={{ fontSize: "17px" }}/>
                <TextField
                    placeholder="Find a view"
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                border: "none",
                            },
                            "& input": {
                                padding: "4px 0px",
                                height: "100%",
                                boxSizing: "border-box",
                                fontSize: "13px",
                            }
                        },
                    }}
                />
                <SettingsOutlinedIcon sx={{ fontSize: "17px" }}/>
            </Box>
            {isOpen && viewList.map((view) => (
                <Box
                    key={view.viewId}
                    onMouseEnter={() => setHoveredView(true)}
                    onMouseLeave={() => setHoveredView(false)}
                    sx={{
                        "&:hover": { backgroundColor: "#f5f5f5" },
                        width: "100%",
                        height: "32.25px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor:
                            currentViewId === view.viewId ? "#e0e0e0" : "transparent",
                        p: "8px 12px",
                    }}
                >
                    <Button
                        key={view.viewId}
                        onClick={() => handleSelectView(view.viewId)}
                        sx={{
                            color: "black",
                            textTransform: "none",
                            fontSize: "13px",
                            px: 0,
                        }}
                    >
                        <TableChartOutlinedIcon
                            sx={{ fontSize: "17px", mr: 1 }}
                            color="primary"
                        />
                        {view.name}
                    </Button>
                    {hoveredView && (
                        <Button
                            sx={{
                                minWidth: 0,
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                padding: 0,
                                justifyContent: "center",
                                alignItems: "center",
                                color: "#45454a",
                            }}
                            onClick={(e) => {
                                setViewAnchorEl(e.currentTarget);
                            }}
                        >
                            <MoreHorizOutlinedIcon/>
                        </Button>
                    )}
                </Box>              
            ))}
            
            <Menu
                open={Boolean(viewAnchorEl)}
                anchorEl={viewAnchorEl}
                onClose={() => setViewAnchorEl(null)}
            >
                <MenuItem>{`Add to 'My favourites'`}</MenuItem>
                <MenuItem>Rename view</MenuItem>
                <MenuItem>Duplicate view</MenuItem>
                <MenuItem
                    disabled={viewList.length === 1}
                >
                Delete View</MenuItem>
            </Menu>

        </Drawer>
    )
}