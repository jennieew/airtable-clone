import MenuIcon from '@mui/icons-material/Menu';
import SearchBar from "./searchBar";
import { AppBar, Avatar, Box, Button, IconButton, Tooltip } from "@mui/material";
import { signOut } from "next-auth/react";
import { api } from '@/trpc/react';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { useState } from 'react';
import ProfileMenu from './profileMenu';

interface HeaderProps {
  sidebarOpen: boolean;
  setSideBarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSideBarOpen}: HeaderProps) {
  const toggleSidebar = () => setSideBarOpen(!sidebarOpen);

  const { data: user, isLoading } = api.user.getCurrentUser.useQuery();

  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const handleCloseProfileMenu = () => {
    setProfileAnchor(null);
    setOpenProfileMenu(false);
  }

  const firstInitial = user?.name ? user.name[0]!.toUpperCase() : "?";
  
  return (
    <AppBar
      position="fixed"
      sx={{
        height: "56px",
        backgroundColor: "white",
        boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.1)" ,
        color: "gray",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        pl: "12px",
        pr: "16px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Box
        component="main"
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          ml: "8px",
        }}
      >
        <Tooltip title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
          <IconButton
            edge="start"
            onClick={toggleSidebar}
            sx={{
              pr: "8px",
              pl: "4px",
              mr: 2,
              color: "gray",
            }}
          >
            <MenuIcon sx={{ fontSize: 20 }}/>
          </IconButton>
        </Tooltip>
        <img 
          src="/airtable-full-logo.png" alt="airtable-logo" 
          className="w-[102px] h-[22px] object-contain mr-[4px]"
        />
      </Box>
      <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center"}}>
          <SearchBar/>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Button
          sx={{
            textTransform: "none",
            color: "#45454a",
            fontSize: "13px",
          }}
        >
          <HelpOutlineOutlinedIcon sx={{ height: 16, width: 16, mr: 0.5, transform: "translateY(-1px)" }}/>
          Help
        </Button>
        <Tooltip title="Notifications">
          <IconButton
            sx={{
              color: "#45454a",
              border: "1px solid rgba(0,0,0,0.1)",
              width: 28,
              height: 28,
            }}
          >
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 18 }}/>
          </IconButton>
        </Tooltip>
        <Tooltip title="Account">
          <IconButton
            onClick={(e) => {
              setProfileAnchor(e.currentTarget);
              setOpenProfileMenu(!openProfileMenu);
            }}
          >
            <Box
              sx={{
                borderRadius: "50%",
                padding: "1px",
                bgcolor: "transparent",
                border: "1px solid rgba(0,0,0,0.1)",
                display: "inline-flex",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#fcbb09",
                  color: "#45454a",
                  width: 26,
                  height: 26,
                  fontSize: "13px",
                }}
              >
                {firstInitial}
              </Avatar>
            </Box>
          </IconButton>
        </Tooltip>
      </Box>
      <ProfileMenu openProfileMenu={openProfileMenu} profileAnchor={profileAnchor} onClose={handleCloseProfileMenu} user={user}/>
    </AppBar>
  )
}