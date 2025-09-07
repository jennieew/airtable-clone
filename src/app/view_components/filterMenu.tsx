import { Button, IconButton, Menu, MenuItem, Select, TextField } from "@mui/material"
import type { Cell, Column, Row, Table, View } from "@prisma/client";
import { useEffect, useState } from "react";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { api } from "@/utils/api";

const OPERATORS = ["contains", "does not contain", "is", "is not", "is empty", "is not empty"] as const;

export interface FilterCondition {
  logical?: "and" | "or" | "where";
  column: string;
  operator: typeof OPERATORS[number];
  value: string | number;
}

type RowWithRelations = Row & { values: Cell[] };

type TableWithRelations = Table & {
  columns: Column[];
  rows: RowWithRelations[];
  views: View[];
};

type filterMenuProps = {
  openFilterMenu: boolean;
  filterAnchor: HTMLElement | null;
  onClose: () => void;
  view: View;
  table: TableWithRelations;
};

const isCompleteFilter = (f: FilterCondition): boolean => {
  // must have a column and operator always
  if (!f.column || !f.operator) return false;

  // make sure value not empty
  if (f.operator !== "is empty" && f.operator !== "is not empty") {
    return f.value !== "" && f.value !== undefined && f.value !== null;
  }

  return true;
};

export default function FilterMenu({ openFilterMenu, filterAnchor, onClose, view, table }: filterMenuProps) {
  const [filters, setFilters] = useState<FilterCondition[]>(
    ((view.filters as unknown) as FilterCondition[]) || []
  );

  const utils = api.useUtils();
  const addOrUpdateFilters = api.view.addOrUpdateFilter.useMutation({
    onMutate: async ({ viewId, newFilter }) => {
      await utils.view.getView.cancel({ viewId });
      await utils.view.getViews.cancel();

      const previousView = utils.view.getView.getData({ viewId });

      utils.view.getView.setData({ viewId }, (old) => {
        if (!old) return old;
        
        const existingFilters = (old.filters ?? []);
        const updatedFilters = (() => {
          const index = existingFilters.findIndex(
            (f) => f.column === newFilter.column && f.operator === newFilter.operator
          );
          if (index >= 0) {
            return existingFilters.map((f, i) =>
              i === index ? newFilter : f
            );
          }
          return [...existingFilters, newFilter];
        })();

        return {
          ...old,
          filters: updatedFilters,
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

  const addFilter = () => {
    const firstCol = table?.columns?.[0]?.columnId;
    if (!firstCol) return;

    let newLogical: "where" | "and" | "or" | undefined;

    if (filters.length === 0) {
      newLogical = "where";
    } else if (filters.length === 1) {
      newLogical = "and";
    } else {
      newLogical = filters[1]?.logical ?? "and";
    }

    const newFilter: FilterCondition = {
      logical: newLogical,
      column: firstCol,
      operator: "contains",
      value: "",
    };

    setFilters([...filters, newFilter]);

    addOrUpdateFilters.mutate({
      viewId: view.viewId,
      newFilter,
    });
  };

  const deleteFilter = api.view.deleteFilter.useMutation({
    onMutate: async ({ viewId, index }) => {
      await utils.view.getView.cancel({ viewId });
      await utils.view.getViews.cancel();

      const previousView = utils.view.getView.getData({ viewId });

      utils.view.getView.setData({ viewId }, (old) => {
        if (!old) return old;
        
        const existingFilters = (old.filters ?? []) as FilterCondition[];
        const updatedFilters = existingFilters.filter((_, i) => i !== index);

        if (index === 0 && updatedFilters[0]) {
          updatedFilters[0] = {
            ...updatedFilters[0],
            logical: "where"
          }
        }

        return {
          ...old,
          filters: updatedFilters,
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
  })

  const handleDeleteFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));

    // if it is a valid filter, then delete from db
    deleteFilter.mutate({
      viewId: view.viewId,
      index
    });
  };

  const handleUpdateFilter = (i: number, updated: Partial<FilterCondition>) => {
    const current = filters[i] ?? { column: "", operator: "contains", value: "" };
  
    const candidate: FilterCondition = {
      column: updated.column ?? current.column,
      operator: updated.operator ?? current.operator,
      value: updated.value ?? current.value,
      logical: i === 0 ? "where" : updated.logical ?? filters[1]?.logical ?? "and",
    };

    setFilters(filters.map((f, j) => j === i ? candidate : f));
    // send to backend only when column/operator/value exist
    if (candidate.column && candidate.operator) {
      addOrUpdateFilters.mutate({
      viewId: view.viewId,
      index: i,
      newFilter: candidate,
      });
    }
  };

  return (
    <Menu
      anchorEl={filterAnchor}
      open={openFilterMenu}
      onClose={onClose}
    >
      {!filters || filters.length === 0 ? (
        <MenuItem disableRipple disableTouchRipple>No filter conditions are applied</MenuItem>
      ) : (
        [
          <MenuItem key="intro" disableRipple disableTouchRipple>In this view, show records</MenuItem>,
          ...filters.map((f, i) => (
            <MenuItem key={i} disableRipple disableTouchRipple>
              {i === 0 ? (
                "where"
              ) : i === 1 ? (
                <Select
                  value={f.logical}
                  onChange={(e) => {
                    setFilters(filters.map((fi, j) => j === i ? { ...fi, logical: e.target.value as "and" | "or"} : fi));
                    handleUpdateFilter(i, {
                      logical: e.target.value as "and" | "or",
                    });
                  }}
                >
                  <MenuItem value={"and"}>and</MenuItem>
                  <MenuItem value={"or"}>or</MenuItem>
                </Select>
              ) : (
                f.logical
              )}

              <Select
                value={f.column}
                onChange={(e) => {
                  handleUpdateFilter(i, { column: e.target.value });
                }}
              >
                {table.columns.map((col) => (
                  <MenuItem key={col.columnId} value={col.columnId}>{col.name}</MenuItem>
                ))}
              </Select>

              <Select
                value={f.operator}
                onChange={(e) => {
                  handleUpdateFilter(i, {
                    operator: e.target.value,
                  });
                }}
              >
                {OPERATORS.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}{op !== "is empty" && op !== "is not empty" ? "..." : ""}
                  </MenuItem>
                ))}
              </Select>

              <TextField
                value={f.value}
                onChange={(e) => {
                  setFilters(filters.map((fi, j) => j === i ? { ...fi, value: e.target.value } : fi));
                }}
                onBlur={(e) => handleUpdateFilter(i, { value: e.target.value })}
                disabled={f.operator === "is empty" || f.operator === "is not empty"}
              />

              <IconButton
                onClick={() => handleDeleteFilter(i)}
              >
                <DeleteOutlineIcon/>
              </IconButton>
            </MenuItem>
          ))
        ]
      )}

      <MenuItem 
        disableRipple disableTouchRipple
        sx={{display: "flex"}}
      >
        <Button
          sx={{
            textTransform: "none",
            color: "black",
          }}
          onClick={addFilter}
        >+ Add condition</Button>
        <Button
          sx={{
            textTransform: "none",
            color: "black",
          }}  
        >+ Add condition group</Button>
      </MenuItem>
    </Menu>
  )
}