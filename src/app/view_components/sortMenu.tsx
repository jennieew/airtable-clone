import { Box, Button, Divider, Menu, MenuItem, Select, Tooltip } from "@mui/material";
import type { Cell, Column, Row, Table, View } from "@prisma/client";
import { useEffect, useState } from "react";
import { type SortCondition, type ViewWithFilters } from "../types";
import { api } from "@/utils/api";

type RowWithRelations = Row & { values: Cell[] };

type TableWithRelations = Table & {
  columns: Column[];
  rows: RowWithRelations[];
  views: View[];
};

type sortMenuProps = {
  openSortMenu: boolean;
  sortAnchor: HTMLElement | null;
  onClose: () => void;
  view: ViewWithFilters;
  columns: TableWithRelations["columns"];
};

export default function SortMenu({ openSortMenu, sortAnchor, onClose, view, columns }: sortMenuProps) {
  const [sorts, setSorts] = useState<SortCondition[]>((view.sort ?? []) as unknown as SortCondition[]);
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);

  const utils = api.useUtils();

  useEffect(() => {
    setSorts((view.sort ?? []) as unknown as SortCondition[]);
  }, [view.sort]);

  /*
    ADD or CHANGE
  */
  const addOrUpdateSort = api.view.addOrUpdateSort.useMutation({
    onMutate: async ({ viewId, newSort }) => {
      await utils.view.getView.cancel({ viewId });
      await utils.view.getViews.cancel();

      const previousView = utils.view.getView.getData({ viewId });

      utils.view.getView.setData({ viewId }, (old) => {
        if (!old) return old;
        
        const existingSort = (old.sort ?? []);
        const updatedSort = (() => {
          const index = existingSort.findIndex(
            (f) => f.column === newSort.column && f.direction === newSort.direction
          );
          if (index >= 0) {
            return existingSort.map((f, i) =>
              i === index ? newSort : f
            );
          }
          return [...existingSort, newSort];
        })();

        return {
          ...old,
          sort: updatedSort,
        };
      });

      return { previousView };
    },

    onError: (err, variables, context) => {
      if (context?.previousView) {
        utils.view.getView.setData({ viewId: view.viewId }, context.previousView);
      }
    },
    onSettled: async () => {
      await utils.view.getView.invalidate({ viewId: view.viewId });
      await utils.table.getTable.invalidate({ tableId: view.tableId });
    }
  });

  const handleAddSort = (columnId: string) => {
    const newSort: SortCondition = {
      column: columnId,
      direction: "asc",
    };

    setSorts([...sorts, newSort]);

    addOrUpdateSort.mutate({
      viewId: view.viewId,
      newSort,
    });
  };

  const handleUpdateSort = (i: number, updated: Partial<SortCondition>) => {
    const current = sorts[i] ?? { column: "", direction: "asc" };
  
    const candidate: SortCondition = {
      column: updated.column ?? current.column,
      direction: updated.direction ?? current.direction,
    };

    const updatedFilters = sorts.map((f, j) => (j === i ? candidate : f));
    setSorts(updatedFilters);

    addOrUpdateSort.mutate({
      viewId: view.viewId,
      index: i,
      newSort: candidate,
    })
  };

  /*
    DELETE
  */
  const deleteSort = api.view.deleteSort.useMutation({
    onMutate: async ({ viewId, index }) => {
      await utils.view.getView.cancel({ viewId });
      await utils.view.getViews.cancel();

      const previousView = utils.view.getView.getData({ viewId });

      utils.view.getView.setData({ viewId }, (old) => {
        if (!old) return old;
        
        const existingSort = (old.sort ?? []) as SortCondition[];
        const updatedSort = existingSort.filter((_, i) => i !== index);

        setSorts(updatedSort);

        return {
          ...old,
          sort: updatedSort,
        };
      });

      return { previousView };
    },
    onError: (err, variables, context) => {
      if (context?.previousView) {
        utils.view.getView.setData({ viewId: variables.viewId }, context.previousView);
      }
    },
    onSettled: async (data, err, variables) => {
      await utils.view.getView.invalidate({ viewId: variables.viewId });
      await utils.table.getTable.invalidate({ tableId: view.tableId });
    }
  });

  const handleDeleteSort = (index: number) => {
    const updatedSort = sorts.filter((_, i) => i !== index);

    setSorts(updatedSort);

    deleteSort.mutate({
      viewId: view.viewId,
      index
    });
  }

  return (
    <>
      <Menu
        anchorEl={sortAnchor}
        open={openSortMenu}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: { width: "452px" },
          },
        }}
      >
        <MenuItem disableRipple disableTouchRipple>Sort by</MenuItem>
        <Divider />

        {sorts.length === 0 ? (
          // choose column
          columns.map((col) => (
            <MenuItem
              key={col.columnId}
              onClick={() => handleAddSort(col.columnId)}
            >
              {col.name}
            </MenuItem>
          ))
        ) : (
          // show rows with sorts
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {sorts.map((sort, i) => {
              const selectedCol = columns.find((c) => c.columnId === sort.column);

              return (
                <Box
                  key={i}
                  sx={{ display: "flex", flexDirection: "row", gap: 1, px: 1, py: 1 }}
                >
                  {/* Column selector */}
                  <Select
                    value={sort.column}
                    onChange={(e) =>
                      handleUpdateSort(i, { column: e.target.value as string })
                    }
                    sx={{ minWidth: 120 }}
                  >
                    {columns.map((col) => (
                      <MenuItem key={col.columnId} value={col.columnId}>
                        {col.name}
                      </MenuItem>
                    ))}
                  </Select>

                  {/* Direction selector */}
                  <Select
                    value={sort.direction}
                    onChange={(e) =>
                      handleUpdateSort(i, { direction: e.target.value as "asc" | "desc" })
                    }
                    sx={{ minWidth: 140 }}
                  >
                    {selectedCol?.type === "NUMBER"
                      ? [
                          <MenuItem key="asc" value="asc">Increasing</MenuItem>,
                          <MenuItem key="desc" value="desc">Decreasing</MenuItem>
                        ]
                      : [
                          <MenuItem key="asc" value="asc">A → Z</MenuItem>,
                          <MenuItem key="desc" value="desc">Z → A</MenuItem>
                        ]}
                  </Select>

                  {/* Delete button */}
                  <Tooltip title="Remove sort">
                    <Button
                      onClick={() => handleDeleteSort(i)}
                      sx={{ minWidth: "auto", minHeight: "auto" }}
                    >
                      X
                    </Button>
                  </Tooltip>
                </Box>
              );
            })}

            {/* Only show "+ Add another sort" when there is at least one sort */}
            <MenuItem
              disableRipple
              disableTouchRipple
              sx={{ display: "flex" }}
              onClick={(e) => setAddMenuAnchor(e.currentTarget)}
            >
              + Add another sort
            </MenuItem>
          </Box>
        )}
      </Menu>
    
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={() => setAddMenuAnchor(null)}
      >
        {columns
          .filter(col => !sorts.some(s => s.column === col.columnId)) // exclude already used
          .map(col => (
            <MenuItem
              key={col.columnId}
              onClick={() => {
                handleAddSort(col.columnId);
                setAddMenuAnchor(null);
              }}
            >
              {col.name}
            </MenuItem>
          ))}
        {columns.filter(col => !sorts.some(s => s.column === col.columnId)).length === 0 && (
          <MenuItem disabled>No results</MenuItem>
        )}
      </Menu>
    </>    
  );
}