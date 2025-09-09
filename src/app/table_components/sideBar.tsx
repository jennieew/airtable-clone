import { Button, Drawer, TextField } from "@mui/material";
import { api } from "@/utils/api";
import AddIcon from '@mui/icons-material/Add';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import type { FilterCondition, TableWithRelations, ViewWithFilters } from "../types";
import { useState } from "react";

interface SideBarProps {
  openSidebar: boolean;
  setOpenSideBar: (open: boolean) => void;
  hovered: boolean;
  setHovered: (open: boolean) => void;
  table: TableWithRelations | undefined;
  currentView: ViewWithFilters;
  setCurrentView: React.Dispatch<React.SetStateAction<ViewWithFilters>>;
}

export default function TableSideBar({ openSidebar, setOpenSideBar, hovered, setHovered, table, currentView, setCurrentView }: SideBarProps) {
    const toggleSidebar = () => setOpenSideBar(!openSidebar);
    const isOpen = openSidebar || hovered;
    const utils = api.useUtils();

    const [tableState, setTableState] = useState<TableWithRelations>(table!);

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
                sort: "",
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
            setTableState(prev => prev ? { ...prev, views: [...prev.views, newViewTemp] } : prev);
            setCurrentView(newViewTemp);
            
            return { previousTable };
        },
        onError: (err, variables, context) => {
            if (context?.previousTable) {
                utils.table.getTable.setData({ tableId: table.tableId }, context.previousTable);
            }
        },
        onSuccess: async () => {
            await utils.table.getTable.invalidate({ tableId: table.tableId });
        },
    })

    const handleSelectView = (viewId: string) => {
        if (currentView.viewId === viewId) return;
        const selected = table?.views.find(v => v.viewId === viewId);
        if (!selected) return;

        const typedView: ViewWithFilters = {
            ...selected,
            filters: Array.isArray(selected.filters)
                ? (selected.filters as unknown as FilterCondition[])
                : [],
        };

        setCurrentView(typedView);
    };

    return (
        <Drawer
            open={isOpen}
            onClose={toggleSidebar}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            variant="permanent"
            sx={{
                width: isOpen ? "300px" : "0px",
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: isOpen ? "300px" : "0px",
                    boxSizing: "border-box",
                    position: "relative",
                    overflowX: "hidden",
                },
                paddingY: 2,
            }}
        >
            <Button
                onClick={() => createView.mutate({ tableId: table.tableId })} 
                sx={{ textTransform: "none", color: "black", justifyContent: "start" }}
            >
                <AddIcon fontSize="small"/>
                Create new...
            </Button>
            <div className="flex items-center">
                <TextField
                    // variant="standard"
                    placeholder="Find a view"
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                border: "none",
                            },
                        },
                    }}
                />
                <SettingsOutlinedIcon fontSize="small"/>
            </div>
            {isOpen && tableState?.views.map((view, index) => (
                <Button
                    key={view.viewId}
                    onClick={() => handleSelectView(view.viewId)}
                    sx={{
                    color: "black",
                    textTransform: "none",
                    justifyContent: "start",
                    backgroundColor:
                        currentView.viewId === view.viewId ? "#e0e0e0" : "transparent",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                    }}
                >
                    <TableChartOutlinedIcon fontSize="small" color="primary"/> {view.name}
                </Button>
            ))}
        </Drawer>
    )
}