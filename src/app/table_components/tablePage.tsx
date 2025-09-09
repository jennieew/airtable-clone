import { Box } from "@mui/material";
import { useState } from "react";
import TableHeaderBar from "./header";
import TableSideBar from "./sideBar";
import TableDisplay from "./table";
import type { FilterCondition, RowWithRelations, TableWithRelations, ViewWithFilters } from "../types";

type TablePageProps = {
    table: TableWithRelations | undefined;
};

export default function TablePage({ table }: TablePageProps) {
    const [openSidebar, setOpenSideBar] = useState(false);
    const [hovered, setHovered] = useState(false);

    const [tableData, setTableData] = useState<RowWithRelations[]>([]);

    const [currentView, setCurrentView] = useState<ViewWithFilters>(() => {
        const initial = table?.views.find(v => v.viewId === table?.currentView) ?? table?.views[0];
        return initial
            ? {
                ...initial,
                filters: (initial.filters as unknown as FilterCondition[]) ?? [],
            }
            : {
            viewId: crypto.randomUUID(),
            tableId: table?.tableId ?? "",
            name: "Default View",
            description: "",
            hiddenFields: "",
            filters: [],
            groupBy: "",
            sort: "",
            color: "",
            rowHeight: "SHORT",
            };
    });

    if (!table || !currentView) return null;

    return (
        <Box sx={{ display: "flex", flexDirection: "column"}}>
            <TableHeaderBar
                openSidebar={openSidebar} 
                setOpenSideBar={setOpenSideBar} 
                setHovered={setHovered} 
                view={currentView}
                setCurrentView={setCurrentView}
                table={table}
            />
            <Box sx={{ display: "flex", flex: 1 }}>
                <TableSideBar 
                    openSidebar={openSidebar} 
                    setOpenSideBar={setOpenSideBar} 
                    hovered={hovered} 
                    setHovered={setHovered} 
                    table={table}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                />
                <div className="bg-[#f7f8fc]">
                    {table && (
                        <TableDisplay tableId={table.tableId} view={currentView} setCurrentView={setCurrentView} />
                    )}
                </div>
            </Box>
        </Box>
    )
}