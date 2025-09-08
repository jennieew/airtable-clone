import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import TableHeaderBar from "./header";
import TableSideBar from "./sideBar";
import type { Cell, Column, Row, Table, View } from "@prisma/client";
import TableDisplay, { type FilterCondition } from "./table";

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

    const [filters, setFilters] = useState<FilterCondition[]>([]);

    const currentView = table?.views.find((v) => v.viewId === table.currentView) ?? table?.views[0];
    
    useEffect(() => {
        if (!currentView) return;
        setFilters(currentView.filters as unknown as FilterCondition[]);
    }, [currentView]);

    if (!table || !currentView) throw new Error("Table not found!!");

    return (
        <Box sx={{ display: "flex", flexDirection: "column"}}>
            <TableHeaderBar 
                openSidebar={openSidebar} 
                setOpenSideBar={setOpenSideBar} 
                setHovered={setHovered} 
                view={currentView} 
                table={table}
                filters={filters}
                setFilters={setFilters}
            />
            <Box sx={{ display: "flex", flex: 1, backgroundColor:"#f7f8fc"}}>
                <TableSideBar openSidebar={openSidebar} setOpenSideBar={setOpenSideBar} hovered={hovered} setHovered={setHovered} table={table}/>
                {table && (
                    <TableDisplay tableId={table.tableId} view={currentView} filters={filters} setFilters={setFilters}/>
                )}
            </Box>
        </Box>
    )
}