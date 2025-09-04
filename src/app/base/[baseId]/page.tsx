"use client";

import BaseHeader from "@/app/base_components/header";
import BaseSideBar from "@/app/base_components/sideBar";
import TableDisplay from "@/app/base_components/table";
import { useParams } from "next/navigation";
import { api } from "@/utils/api";

import { useState } from "react";
import { Box, Button } from "@mui/material";
import TableTabs from "@/app/base_components/tableTabs";

export default function BasePage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const params = useParams();
  const baseId = params.baseId as string;
  const utils = api.useUtils();

  // get base
  const { data: base, isLoading } = api.base.getBase.useQuery({ baseId });

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const createTable = api.table.createTable.useMutation({
    onMutate: async ({ baseId }) => {
      // make sure that any outgoing getBase requests dont overwrite
      await utils.base.getBase.cancel({ baseId });

      const previousBase = utils.base.getBase.getData({ baseId });
      utils.base.getBase.setData({ baseId }, (old) => {
        if (!old || !previousBase) return old;

        return {
          ...old,
          tables: [
            ...old.tables,
            { 
              tableId: `temp-${Date.now()}`,
              baseId: old.baseId,
              authorId: old.authorId,
              name: `Table ${previousBase?.tableCount + 1}`, 
              columns: [], 
              rows: [] },
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

  if (isLoading) return <p>Loading...</p>;
  if (!base) return <p>Base not found</p>;

  // if a table is being created, disable create new table
  const isCreateDisabled = createTable.status === "pending" || base?.tables.some(t => t.tableId.startsWith("temp-"));

  return (
    <div>
      <BaseSideBar/>
      <BaseHeader base={base}/>
      <div className="pl-[60px]">
        {base && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TableTabs tables={base.tables} selectedTab={selectedTab} setSelectedTab={setSelectedTab} baseId={base.baseId}/>
              <Button 
                onClick={() => createTable.mutate({ baseId })}
                disabled={isCreateDisabled}
                sx={{
                  color: "text.primary"
                }}
              >+ New Table</Button>
            </Box>
            {base.tables[selectedTab] && (
              <TableDisplay tableId={base.tables[selectedTab].tableId} />
            )}
          </Box>
        )}
      </div>
    </div>
  );
}