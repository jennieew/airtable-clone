import MenuIcon from '@mui/icons-material/Menu';
import SearchBar from "../_components/searchBar";
import { AppBar, Box, Button, IconButton, Tooltip } from "@mui/material";
import { signOut } from "next-auth/react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSideBarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSideBarOpen}: HeaderProps) {
  const toggleSidebar = () => setSideBarOpen(!sidebarOpen);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };
  
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
      <Box>
        <Button onClick={handleSignOut}>
          Sign Out
        </Button>
      </Box>
    </AppBar>
  )
}