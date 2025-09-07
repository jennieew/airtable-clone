import { Box, Button, IconButton, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import FilterMenu from "../view_components/filterMenu";
import SortMenu from "../view_components/sortMenu";
import type { Cell, Column, Row, Table, View } from "@prisma/client";

type RowWithRelations = Row & { values: Cell[] };

type TableWithRelations = Table & {
  columns: Column[];
  rows: RowWithRelations[];
  views: View[];
};

interface HeaderProps {
  openSidebar: boolean;
  setOpenSideBar: (open: boolean) => void;
  setHovered: (open: boolean) => void;
  view: View;
  table: TableWithRelations;
}

export default function TableHeaderBar({ openSidebar, setOpenSideBar, setHovered, view, table }: HeaderProps) {
    const [isEditingViewName, setIsEditingViewName] = useState(false);
    const [viewName, setViewName] = useState(view.name);

    const inputRef = useRef<HTMLInputElement>(null);

    const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
    const [openFilterMenu, setOpenFilterMenu] = useState(false);
    const handleCloseFilterMenu = () => {
        setFilterAnchor(null);
        setOpenFilterMenu(false);
    }

    const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);
    const [openSortMenu, setOpenSortMenu] = useState(false);
    const handleCloseSortMenu = () => {
        setSortAnchor(null);
        setOpenSortMenu(false);
    }

    // highlight the view name when double clicked
    useEffect(() => {
        if (isEditingViewName && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingViewName]);

    return (
        <Box className="flex" sx={{borderBottom: "1px solid rgba(0,0,0,0.1)"}}>
            <IconButton
                onClick={() => setOpenSideBar(!openSidebar)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <MenuIcon/>
            </IconButton>
            {isEditingViewName ? (
                <TextField
                    value={viewName}
                    inputRef={inputRef}
                    onChange={(e) => setViewName(e.target.value)}
                    onBlur={() => setIsEditingViewName(false)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") setIsEditingViewName(false); // exit on Enter
                    }}
                />
                ) : (
                    <Button
                        onDoubleClick={() => setIsEditingViewName(true)}
                        sx={{ textTransform: "none", color: "black" }}
                    >
                        {viewName}
                    </Button>
                )
            }

            <div>
                <Button sx={{ textTransform: "none", color: "black" }}>Hide Fields</Button>
                <Button 
                    sx={{ textTransform: "none", color: "black" }}
                    onClick={(e) => {
                        setFilterAnchor(e.currentTarget);
                        setOpenFilterMenu(!openFilterMenu);
                    }}
                >Filter</Button>
                <Button sx={{ textTransform: "none", color: "black" }}>Group</Button>
                <Button 
                    sx={{ textTransform: "none", color: "black" }}
                    onClick={(e) => {
                        setSortAnchor(e.currentTarget);
                        setOpenSortMenu(!openSortMenu);
                    }}
                >Sort</Button>
                <Button sx={{ textTransform: "none", color: "black" }}>Color</Button>
                <Button sx={{ textTransform: "none", color: "black" }}>Row height</Button>
                <Button sx={{ textTransform: "none", color: "black" }}>Share and sync</Button>
            </div>

            <FilterMenu filterAnchor={filterAnchor} openFilterMenu={openFilterMenu} onClose={handleCloseFilterMenu} view={view} table={table}/>
            <SortMenu sortAnchor={sortAnchor} openSortMenu={openSortMenu} onClose={handleCloseSortMenu} viewId={""} table={table}/>
        </Box>
    )
}