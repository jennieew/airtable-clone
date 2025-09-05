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

    return (
        <Box sx={{ display: "flex", flexDirection: "column"}}>
            <TableHeaderBar openSidebar={openSidebar} setOpenSideBar={setOpenSideBar} setHovered={setHovered}/>
            <Box sx={{ display: "flex", flex: 1}}>
                <TableSideBar openSidebar={openSidebar} setOpenSideBar={setOpenSideBar} hovered={hovered} table={table}/>
                {table && (
                    <TableDisplay tableId={table.tableId} />
                )}
            </Box>
        </Box>
    )
}