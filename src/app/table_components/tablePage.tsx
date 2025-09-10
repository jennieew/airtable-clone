import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import TableHeaderBar from "./header";
import TableSideBar from "./sideBar";
import TableDisplay from "./table";
import type { FilterCondition, RowWithRelations, TableWithRelations, ViewWithFilters } from "../types";
import { api } from "@/utils/api";

type TablePageProps = {
    table: TableWithRelations | undefined;
};

export default function TablePage({ table }: TablePageProps) {
    const [openSidebar, setOpenSideBar] = useState(false);
    const [hovered, setHovered] = useState(false);

    // const [tableData, setTableData] = useState<RowWithRelations[]>([]);
    const [currentViewId, setCurrentViewId] = useState<string>(
        table?.currentView ?? table?.views[0]?.viewId ?? ""
    );

    const { data: currentView, isLoading } = api.view.getView.useQuery({ viewId: currentViewId });

    if (!table) return null;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <TableHeaderBar
            openSidebar={openSidebar}
            setOpenSideBar={setOpenSideBar}
            setHovered={setHovered}
            view={currentView ?? {} as ViewWithFilters}
            table={table}
            isLoading={isLoading}
        />

        <Box sx={{ display: "flex", flex: 1 }}>
            <TableSideBar
            openSidebar={openSidebar}
            setOpenSideBar={setOpenSideBar}
            hovered={hovered}
            setHovered={setHovered}
            table={table}
            currentViewId={currentViewId}
            setCurrentViewId={setCurrentViewId}
            />

            <div className="bg-[#f7f8fc]" style={{ flex: 1 }}>
            {isLoading ? (
                <div>Loading view...</div>
            ) : currentView ? (
                <TableDisplay tableId={table.tableId} view={currentView}/>
            ) : (
                <div>No view selected</div>
            )}
            </div>
        </Box>
        </Box>
    );
}