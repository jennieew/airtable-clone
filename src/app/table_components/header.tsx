import { Box, Button, IconButton, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import SortMenu from "../view_components/sortMenu";
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
import type { TableWithRelations, ViewWithFilters } from "../types";
import FilterMenu from "../view_components/filterMenu";

interface HeaderProps {
  openSidebar: boolean;
  setOpenSideBar: (open: boolean) => void;
  setHovered: (open: boolean) => void;
  view: ViewWithFilters;
  table: TableWithRelations;
  isLoading: boolean;
}

export default function TableHeaderBar({ openSidebar, setOpenSideBar, setHovered, view, table, isLoading }: HeaderProps) {
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

    useEffect(() => {
        setViewName(view.name);
    },[view]);

    return (
        <Box 
            className="flex" 
            sx={{
                borderBottom: "1px solid rgba(0,0,0,0.1)",
                overflow: "hidden",
                height: "48px",
            }}
        >
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

            {!isLoading && (
                <div className="flex items-center gap-1 ml-auto">
                <Button>Add 100k Rows</Button>
                <Button sx={{ textTransform: "none", color: "#767881" }}>
                    <VisibilityOffOutlinedIcon fontSize="small" /> Hide Fields
                </Button>
                <Button
                    sx={{ textTransform: "none", color: "#767881" }}
                    onClick={(e) => {
                    setFilterAnchor(e.currentTarget);
                    setOpenFilterMenu(!openFilterMenu);
                    }}
                >
                    <FilterListOutlinedIcon fontSize="small" /> Filter
                </Button>
                <Button sx={{ textTransform: "none", color: "#767881" }}>
                    <ListAltOutlinedIcon fontSize="small" /> Group
                </Button>
                <Button
                    sx={{ textTransform: "none", color: "#767881" }}
                    onClick={(e) => {
                    setSortAnchor(e.currentTarget);
                    setOpenSortMenu(!openSortMenu);
                    }}
                >
                    <ImportExportOutlinedIcon fontSize="small" /> Sort
                </Button>
                <Button sx={{ textTransform: "none", color: "#767881" }}>
                    <FormatColorFillOutlinedIcon fontSize="small" /> Color
                </Button>
                <Button sx={{ textTransform: "none", color: "#767881" }}>
                    <FormatLineSpacingIcon fontSize="small" />
                </Button>
                <Button sx={{ textTransform: "none", color: "#767881" }}>
                    <IosShareIcon fontSize="small" /> Share and sync
                </Button>
                <Button sx={{ color: "#767881" }}>
                    <SearchIcon fontSize="small"/>
                </Button>
                </div>
            )}

            <FilterMenu 
                filterAnchor={filterAnchor} 
                openFilterMenu={openFilterMenu} 
                onClose={handleCloseFilterMenu} 
                view={view}
                columns={table.columns}
            />
            <SortMenu sortAnchor={sortAnchor} openSortMenu={openSortMenu} onClose={handleCloseSortMenu} viewId={""} table={table}/>
        </Box>
    )
}