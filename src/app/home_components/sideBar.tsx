"use client"

import { Box, Button, Divider, Drawer, List } from "@mui/material";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import SidebarItem from "./sideBarItem";
import ShortcutOutlinedIcon from '@mui/icons-material/ShortcutOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { redirect } from "next/navigation";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";

interface SideBarProps {
  sidebarOpen: boolean;
  setSideBarOpen: (open: boolean) => void;
}

export default function SideBar({ sidebarOpen, setSideBarOpen}: SideBarProps) {
  const [hovered, setHovered] = useState(false);
  const toggleSidebar = () => setSideBarOpen(!sidebarOpen);

  const router = useRouter();
  const createBase = api.base.createBase.useMutation();
  const handleCreate = async () => {
    try {
      const newBase = await createBase.mutateAsync();
      console.log("New base created:", newBase);
      router.push(`/base/${newBase.baseId}`);
    } catch (err) {
      console.error("Failed to create base", err);
    }
  };

  const isOpen = sidebarOpen || hovered;
  
  return (
    <Drawer
      variant="permanent"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      open={isOpen}
      onClose={toggleSidebar}
      sx={{
        width: isOpen ? "300px" : "50px",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isOpen ? "300px" : "50px",
          height: `calc(100vh - 56px)`,
          boxSizing: "border-box",
          top: "56px",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <List>
          <SidebarItem icon={HomeOutlinedIcon} label="Home" sidebarOpen={isOpen} onClick={() => redirect('/home')}/>
          <SidebarItem icon={StarBorderRoundedIcon} label="Starred" sidebarOpen={isOpen} onClick={() => redirect('/starred')}/>
          <SidebarItem icon={ShortcutOutlinedIcon} label="Shared" sidebarOpen={isOpen} onClick={() => redirect('/shared')}/>
          <SidebarItem icon={GroupsOutlinedIcon} label="Workspaces" sidebarOpen={isOpen} onClick={() => redirect('/workspaces')}/>
        </List>
        <Divider/>
      </Box>

      <Button 
        variant="contained"
        sx={{ 
          m: 2,
          width: "calc(100% - 32px)",
          height: "30px",
          alignSelf: "center",
        }}
        onClick={() => handleCreate()}
      >
        + Create
      </Button>
    </Drawer>
  )
}