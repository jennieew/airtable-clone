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
  // const filters: FilterCondition[] = ((view.filters as unknown) as FilterCondition[]) || [];
  const [filters, setFilters] = useState<FilterCondition[]>([]);

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
    const firstCol = table?.columns?.[0]?.name;
    if (!firstCol) return;

    setFilters([
      ...filters,
      {
        logical: filters.length === 0 ? undefined : "and",
        column: firstCol,
        operator: "contains",
        value: "",
      },
    ]);
  };

  const handleDeleteFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const validFilters = filters.filter(isCompleteFilter);
    console.log("Saving filters:", validFilters);
    // here you’d call your mutation:
    // await db.view.update({ where: { viewId }, data: { filters: validFilters } })
    onClose();
  };

  const handleUpdateFilter = (i: number, updated: Partial<FilterCondition>) => {
    const newFilters = filters.map((fi, j) => {
      let logicalValue = fi.logical;
      if (j === 0) logicalValue = "where";

      return j === i
        ? { ...fi, ...updated, logical: logicalValue } : fi;
    });

    setFilters(newFilters);

    // apply mutation immediately if filter is valid
    const current = filters[i] ?? { logical: undefined, column: "", operator: "contains" as const, value: "" };
    const candidate: FilterCondition = {
      ...current,
      ...updated,
      logical: i === 0 ? "where" : updated.logical ?? current.logical,
    };
    if (isCompleteFilter(candidate)) {
      addOrUpdateFilters.mutate({
        viewId: view.viewId,
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
              ) : (
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
              )}

              <Select
                value={f.column}
                onChange={(e) => {
                  setFilters(filters.map((fi, j) => j === i ? { ...fi, column: e.target.value } : fi));
                  handleUpdateFilter(i, { column: e.target.value });
                }}
              >
                {table.columns.map((col) => (
                  <MenuItem key={col.columnId} value={col.name}>{col.name}</MenuItem>
                ))}
              </Select>

              <Select
                value={f.operator}
                onChange={(e) => {
                  setFilters(filters.map((fi, j) => j === i ? { ...fi, operator: e.target.value } : fi));
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