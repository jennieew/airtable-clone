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

  // loading the base data
  if (isLoading) return <p>Loading...</p>;
  if (!base) return <p>Base not found</p>;

  // if a table is being created, disable create new table
  const isCreateDisabled = createTable.status === "pending";

  return (
    <div>
      <BaseSideBar/>
      <BaseHeader base={base}/>
      <div className="pl-[56px]">
        {base && (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TableTabs tables={base.tables} selectedTab={selectedTab} setSelectedTab={setSelectedTab} baseId={base.baseId}/>
              <Button
                sx={{
                  color: "text.primary",
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
                  color: "text.primary",
                  textTransform: "none",
                }}
              >+ Add or import</Button>
            </Box>
            <TablePage table={base.tables[selectedTab]}/>
          </Box>
        )}
      </div>
    </div>
  );
}