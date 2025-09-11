import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import TableHeaderBar from "./header";
import TableSideBar from "./sideBar";
import TableDisplay from "./table";
import type { FilterCondition, RowWithRelations, TableWithRelations, ViewWithFilters } from "../types";
import { api } from "@/utils/api";
import { LoadingTable } from "./loadingTable";

type TablePageProps = {
    table: TableWithRelations | undefined;
};

export default function TablePage({ table }: TablePageProps) {
    const [openSidebar, setOpenSideBar] = useState(true);
    const [hovered, setHovered] = useState(false);

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

            <Box sx={{ display: "flex", flex: 1, backgroundColor: "#f7f8fc", overflow: "hidden", height: "100%" }}>
                <TableSideBar
                    openSidebar={openSidebar}
                    setOpenSideBar={setOpenSideBar}
                    hovered={hovered}
                    setHovered={setHovered}
                    table={table}
                    currentViewId={currentViewId}
                    setCurrentViewId={setCurrentViewId}
                />

                <Box sx={{ flex: 1, height: "100%", overflow: "auto" }}>
                    {isLoading ? (
                        <LoadingTable/>
                    ) : currentView ? (
                        <TableDisplay tableId={table.tableId} view={currentView}/>
                    ) : (
                        <div>No view selected</div>
                    )}
                </Box>
            </Box>
        </Box>
    );
}