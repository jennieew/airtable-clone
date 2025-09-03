"use client";

import BaseHeader from "@/app/base_components/header";
import BaseSideBar from "@/app/base_components/sideBar";
import TableDisplay from "@/app/base_components/table";
import { useParams } from "next/navigation";
import { api } from "@/utils/api";

import { useState } from "react";
import { Box, Button, Tab, Tabs } from "@mui/material";

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
        if (!old) return old;
        return {
          ...old,
          tables: [
            ...old.tables,
            { 
              tableId: "temp-id",
              baseId: old.baseId,
              name: `Table ${old.tables.length + 1}`, 
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

  return (
    <div>
      <BaseSideBar/>
      <BaseHeader base={base}/>
      <div className="pl-[60px]">
        {base && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tabs
                value={selectedTab}
                onChange={handleChange}
                aria-label="table tabs"
              >
                {base.tables.map((table, index) => (
                  <Tab key={table.tableId} label={table.name}/>
                ))}
              </Tabs>
              <Button onClick={() => createTable.mutate({ baseId })}>+ New Table</Button>
            </Box>
            {base.tables[selectedTab] && (
              <TableDisplay table={base.tables[selectedTab]} />
            )}
          </Box>
        )}
      </div>
    </div>
  );
}