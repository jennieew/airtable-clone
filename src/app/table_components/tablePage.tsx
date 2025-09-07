import { Box } from "@mui/material";
import { useState } from "react";
import TableHeaderBar from "./header";
import TableSideBar from "./sideBar";
import type { Cell, Column, Row, Table, View } from "@prisma/client";
import TableDisplay from "./table";

type RowWithRelations = Row & { values: Cell[] };

type TableWithRelations = Table & {
  columns: Column[];
  rows: RowWithRelations[];
  views: View[];
};

type TablePageProps = {
    table: TableWithRelations | undefined;
};

export default function TablePage({ table }: TablePageProps) {
    const [openSidebar, setOpenSideBar] = useState(false);
    const [hovered, setHovered] = useState(false);

    if (!table) return null;

    const currentView = table.views.find((v) => v.viewId === table.currentView) ?? table.views[0];
    if (!currentView) throw new Error("View not found!!");

    return (
        <Box sx={{ display: "flex", flexDirection: "column"}}>
            <TableHeaderBar openSidebar={openSidebar} setOpenSideBar={setOpenSideBar} setHovered={setHovered} view={currentView} table={table}/>
            <Box sx={{ display: "flex", flex: 1}}>
                <TableSideBar openSidebar={openSidebar} setOpenSideBar={setOpenSideBar} hovered={hovered} setHovered={setHovered} table={table}/>
                {table && (
                    <TableDisplay tableId={table.tableId} view={currentView}/>
                )}
            </Box>
        </Box>
    )
}