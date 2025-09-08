import { Box, Button, IconButton, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import FilterMenu, { type FilterCondition } from "../view_components/filterMenu";
import SortMenu from "../view_components/sortMenu";
import type { Cell, Column, Row, Table, View } from "@prisma/client";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import ImportExportOutlinedIcon from '@mui/icons-material/ImportExportOutlined';
import FormatColorFillOutlinedIcon from '@mui/icons-material/FormatColorFillOutlined';
import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
import IosShareIcon from '@mui/icons-material/IosShare';
import SearchIcon from '@mui/icons-material/Search';

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
  filters: FilterCondition[];
  setFilters: React.Dispatch<React.SetStateAction<FilterCondition[]>>;
}

export default function TableHeaderBar({ openSidebar, setOpenSideBar, setHovered, view, table, filters, setFilters }: HeaderProps) {
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
                <MenuIcon fontSize="small"/>
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
                        <TableChartOutlinedIcon fontSize="small" color="primary"/> {viewName} <ExpandMoreIcon fontSize="small"/>
                    </Button>
                )
            }

            <div className="flex items-center gap-1 ml-auto">
                <Button>
                    Add 100k Rows
                </Button>
                <Button sx={{ textTransform: "none", color: "black" }}>
                    <VisibilityOffOutlinedIcon fontSize="small"/>
                    Hide Fields
                </Button>
                <Button 
                    sx={{ textTransform: "none", color: "black" }}
                    onClick={(e) => {
                        setFilterAnchor(e.currentTarget);
                        setOpenFilterMenu(!openFilterMenu);
                    }}
                >
                    <FilterListOutlinedIcon fontSize="small"/>
                    Filter
                </Button>
                <Button sx={{ textTransform: "none", color: "black" }}>
                    <ListAltOutlinedIcon fontSize="small"/>
                    Group
                </Button>
                <Button 
                    sx={{ textTransform: "none", color: "black" }}
                    onClick={(e) => {
                        setSortAnchor(e.currentTarget);
                        setOpenSortMenu(!openSortMenu);
                    }}
                >
                    <ImportExportOutlinedIcon fontSize="small"/>
                    Sort
                </Button>
                <Button sx={{ textTransform: "none", color: "black" }}>
                    <FormatColorFillOutlinedIcon fontSize="small"/>
                    Color
                </Button>
                <Button sx={{ textTransform: "none", color: "black" }}>
                    <FormatLineSpacingIcon fontSize="small"/>
                </Button>
                <Button sx={{ textTransform: "none", color: "black" }}>
                    <IosShareIcon fontSize="small"/>
                    Share and sync
                </Button>
                <Button sx={{color: "black"}}>
                    <SearchIcon fontSize="small"/>
                </Button>
            </div>

            <FilterMenu 
                filterAnchor={filterAnchor} 
                openFilterMenu={openFilterMenu} 
                onClose={handleCloseFilterMenu} 
                view={view} 
                table={table}
                filters={filters}
                setFilters={setFilters}
            />
            <SortMenu sortAnchor={sortAnchor} openSortMenu={openSortMenu} onClose={handleCloseSortMenu} viewId={""} table={table}/>
        </Box>
    )
}