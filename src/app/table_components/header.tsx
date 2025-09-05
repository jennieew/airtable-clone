import { Box, Button, IconButton, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';

interface HeaderProps {
  openSidebar: boolean;
  setOpenSideBar: (open: boolean) => void;
//   viewId: string;
}

export default function TableHeaderBar({ openSidebar, setOpenSideBar }: HeaderProps) {
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
                    >
                        {viewName}
                    </Button>
                )
            }

            <div>
                <Button>Hide Fields</Button>
                <Button>Filter</Button>
                <Button>Group</Button>
                <Button>Sort</Button>
                <Button>Color</Button>
                <Button>Row height</Button>
                <Button>Share and sync</Button>
            </div>
        </Box>
    )
}