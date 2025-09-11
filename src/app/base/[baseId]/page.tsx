"use client";

import BaseHeader from "@/app/base_components/header";
import BaseSideBar from "@/app/base_components/sideBar";
import { useParams } from "next/navigation";
import { api } from "@/utils/api";

import { useState } from "react";
import { Box, Button } from "@mui/material";
import TableTabs from "@/app/table_components/tableTabs";
import TablePage from "@/app/table_components/tablePage";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Skeleton } from "@/components/ui/skeleton";

export default function BasePage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const params = useParams();
  const baseId = params.baseId as string;
  const utils = api.useUtils();

  // get base
  const { data: base, isLoading } = api.base.getBase.useQuery({ baseId });

  // create a new table
  const createTable = api.table.createTable.useMutation({
    onMutate: async ({ baseId }) => {
      // make sure that any outgoing getBase requests dont overwrite
      await utils.base.getBase.cancel({ baseId });

      const tempId = crypto.randomUUID();
      const previousBase = utils.base.getBase.getData({ baseId });

      utils.base.getBase.setData({ baseId }, (old) => {
        if (!old || !previousBase) return old;

        return {
          ...old,
          tables: [
            ...old.tables,
            { 
              tableId: tempId,
              baseId: old.baseId,
              authorId: old.authorId,
              name: `Table ${previousBase?.tableCount + 1}`, 
              columns: [], 
              rows: [],
              views: [],
              viewCount: 1,
              // viewIndex: 0,
              currentView: "",
            },
          ],
        };
      });

      return { previousBase };
    },
    onError: (err, variables, context) => {
      if (context?.previousBase) {
        utils.base.getBase.setData({ baseId }, context.previousBase);
      }
    },
    onSuccess: async () => {
      await utils.base.getBase.invalidate({ baseId });
    },
  });
  
  // if a table is being created, disable create new table
  const isCreateDisabled = createTable.status === "pending";

  return (
    <>
      {isLoading || !base ? (
        <div style={{ position: "relative", display: "flex" }}>
          {/* Sidebar Skeleton */}
          <Box sx={{ width: 56, minWidth: 56, height: "100vh", p: 1 }}>
            <Skeleton className="h-full w-full rounded-md" />
          </Box>

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* Header Skeleton */}
            <Box sx={{ height: 56, p: 1 }}>
              <Skeleton className="h-full w-full rounded-md" />
            </Box>

            {/* Empty space for main content */}
            <Box sx={{ flex: 1 }} />
          </Box>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <BaseSideBar/>
          <BaseHeader base={base}/>
          <div className="pl-[56px] pt-[56px]">
            {base && (
              <Box sx={{ display: "flex", flexDirection: "column", position: "relative", zIndex: 1000 }}>
                <Box 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    backgroundColor: "#eff6ff", 
                    m: 0, 
                    p: 0, 
                    height: "32px", 
                    minHeight: "32px",
                    position: "relative",
                  }}
                >
                  <TableTabs tables={base.tables} selectedTab={selectedTab} setSelectedTab={setSelectedTab} baseId={base.baseId}/>

                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "1px",
                      backgroundColor: "#e0e0e0",
                      zIndex: 1, // tabs with zIndex:2 will cover selected tab
                    }}
                  />
                  <Button
                    sx={{
                      color: "#767881",
                      minWidth: "40px",
                      width: "40px",
                      padding: "0px 12px"
                    }}
                  >
                    <ExpandMoreIcon sx={{ fontSize: "16px"}}/>
                  </Button>
                  <Button 
                    onClick={() => createTable.mutate({ baseId })}
                    disabled={isCreateDisabled}
                    sx={{
                      color: "#767881",
                      textTransform: "none",
                      height: "36px",
                      minHeight: "36px",
                      padding: 0,
                    }}
                  >+ Add or import</Button>
                </Box>
                <TablePage table={base.tables[selectedTab]}/>
              </Box>
            )}
          </div>
        </div>
      )}
    </>
  );
}