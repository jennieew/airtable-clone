import { Box, Button, IconButton, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';

interface HeaderProps {
  openSidebar: boolean;
  setOpenSideBar: (open: boolean) => void;
  setHovered: (open: boolean) => void;
//   viewId: string;
}

export default function TableHeaderBar({ openSidebar, setOpenSideBar, setHovered }: HeaderProps) {
    const [isEditingViewName, setIsEditingViewName] = useState(false);
    const [viewName, setViewName] = useState("Grid View"); // update to view name!!

    const inputRef = useRef<HTMLInputElement>(null);

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
                <Button sx={{ textTransform: "none", color: "black" }}>Filter</Button>
                <Button sx={{ textTransform: "none", color: "black" }}>Group</Button>
                <Button sx={{ textTransform: "none", color: "black" }}>Sort</Button>
                <Button sx={{ textTransform: "none", color: "black" }}>Color</Button>
                <Button sx={{ textTransform: "none", color: "black" }}>Row height</Button>
                <Button sx={{ textTransform: "none", color: "black" }}>Share and sync</Button>
            </div>
        </Box>
    )
}