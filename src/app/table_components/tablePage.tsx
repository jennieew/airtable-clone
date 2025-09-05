import { Box } from "@mui/material";
import { useState } from "react";
import TableHeaderBar from "./header";
import TableSideBar from "./sideBar";
import type { Cell, Column, Row, Table } from "@prisma/client";
import TableDisplay from "./table";

type RowWithRelations = Row & { values: Cell[] };

type TableWithRelations = Table & {
  columns: Column[];
  rows: RowWithRelations[];
};

type TablePageProps = {
    table: TableWithRelations | undefined;
};

export default function TablePage({ table }: TablePageProps) {
    const [openSidebar, setOpenSideBar] = useState(false);

    if (!table) return null;

    return (
        <Box sx={{ display: "flex", flexDirection: "column"}}>
            <TableHeaderBar openSidebar={openSidebar} setOpenSideBar={setOpenSideBar}/>
            <Box sx={{ display: "flex"}}>
                <TableSideBar openSidebar={openSidebar} setOpenSideBar={setOpenSideBar}/>
                {table && (
                    <TableDisplay tableId={table.tableId} />
                )}
            </Box>
        </Box>
    )
}