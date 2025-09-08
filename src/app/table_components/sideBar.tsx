import { Box, Button, Drawer, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import type { Cell, Column, Row, Table, View } from "@prisma/client";
import { api } from "@/utils/api";
import type { JsonValue } from "@prisma/client/runtime/library";
import AddIcon from '@mui/icons-material/Add';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';

interface SideBarProps {
  openSidebar: boolean;
  setOpenSideBar: (open: boolean) => void;
  hovered: boolean;
  setHovered: (open: boolean) => void;
  table: TableWithRelations | undefined;
}

type RowWithRelations = Row & { values: Cell[] };

type TableWithRelations = Table & {
  columns: Column[];
  rows: RowWithRelations[];
  views: View[];
};

export default function TableSideBar({ openSidebar, setOpenSideBar, hovered, setHovered, table }: SideBarProps) {
    const toggleSidebar = () => setOpenSideBar(!openSidebar);
    const isOpen = openSidebar || hovered;
    const utils = api.useUtils();

    const [localTable, setLocalTable] = useState(table);

    useEffect(() => {
        setLocalTable(table); // sync when parent updates
    }, [table]);

    const [selectedViewId, setSelectedViewId] = useState(localTable?.currentView ?? localTable?.views[0]?.viewId);

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
                filters: [] as unknown as JsonValue[],
                groupBy: "",
                sort: "",
                color: "",
                rowHeight: "SHORT" as const,
            };

            setLocalTable((old) =>
                old
                ? {
                    ...old,
                    views: [...(old.views || []), newViewTemp],
                    currentView: old.currentView ?? tempId,
                    }
                : old
            );

            utils.table.getTable.setData({ tableId: table.tableId }, (old) => {
                if (!old) return old;
                const typedOld = old as TableWithRelations;
                return {
                ...typedOld,
                views: [...(typedOld.views || []), newViewTemp],
                currentView: typedOld.currentView ?? tempId, // 👈
                };
            });
            
            return { previousTable };
        },
        onError: (err, variables, context) => {
                if (context?.previousTable) {
                    // rollback: restore previous state
                    utils.table.getTable.setData({ tableId: table.tableId }, context.previousTable);
                }
        },
        onSuccess: async () => {
            // ensure table data is fresh
            await utils.table.getTable.invalidate({ tableId: table.tableId });
        },
    })

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
            {localTable?.views.map((view, index) => (
                <Button
                    key={view.viewId}
                    onClick={() => {
                        setSelectedViewId(view.viewId);
                        setLocalTable((old) => old ? { ...old, currentView: view.viewId } : old);
                    }}
                    sx={{
                    color: "black",
                    textTransform: "none",
                    justifyContent: "start",
                    backgroundColor:
                        localTable.currentView === view.viewId ? "#e0e0e0" : "transparent",
                    "&:hover": { backgroundColor: "#f5f5f5" }, // optional hover
                    }}
                >
                    <TableChartOutlinedIcon fontSize="small" color="primary"/> {view.name}
                </Button>
            ))}
        </Drawer>
    )
}