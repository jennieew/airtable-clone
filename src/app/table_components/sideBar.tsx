import { Button, Drawer, TextField } from "@mui/material";
import { useState } from "react";

interface SideBarProps {
  openSidebar: boolean;
  setOpenSideBar: (open: boolean) => void;
}

export default function TableSideBar({ openSidebar, setOpenSideBar }: SideBarProps) {
    const [hovered, setHovered] = useState(false);
    const toggleSidebar = () => setOpenSideBar(!openSidebar);
    
    return (
        <Drawer
            // variant="permanent"
            open={openSidebar}
            // onMouseEnter={() => setHovered(true)}
            // onMouseLeave={() => setHovered(false)}
            onClose={toggleSidebar}
        >
            <Button>+ Create New</Button>
            <TextField placeholder="Find a view"/>
        </Drawer>
    )
}