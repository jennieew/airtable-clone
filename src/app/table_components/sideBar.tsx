import { Box, Button, Drawer, TextField } from "@mui/material";
import { useState } from "react";
import type { Cell, Column, Row, Table, View } from "@prisma/client";
import { api } from "@/utils/api";
import type { JsonValue } from "@prisma/client/runtime/library";

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

    if (!table) return;

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

            utils.table.getTable.setData({ tableId: table.tableId }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    views: [...old.views, newViewTemp],
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
                },
            }}
        >
            <Button
                onClick={() => createView.mutate({tableId: table.tableId})} 
                sx={{ textTransform: "none", color: "black" }}
            >+ Create New...</Button>
            <TextField placeholder="Find a view"/>
            {table.views.map((view) => (
                <Box
                    key={view.viewId}
                >
                    {view.name}
                </Box>
            ))}
        </Drawer>
    )
}