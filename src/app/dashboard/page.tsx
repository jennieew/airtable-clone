"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppBar, Drawer, Icon, IconButton, List, ListItem, Toolbar, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';

export default function DashboardPage() {
  const [sidebarOpen, setSideBarOpen] = useState(true);

  const toggleSidebar = () => setSideBarOpen(!sidebarOpen);

  // const { data: session, status } = useSession();
  // const router = useRouter();

  // useEffect(() => {
  //   if (status === "loading") return;
  //   if (!session) router.push("/signin");
  // }, [session, status, router]);

  // if (status === "loading" || !session) return <div>Loading...</div>;

  // return (
  //   <div className="p-8">
  //     <h1 className="text-3xl font-bold">Dashboard</h1>
  //     <p>Welcome, {session.user?.name}!</p>
  //   </div>
  // );
  return (
    <div>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleSidebar}
            sx={{mr: 2}}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={sidebarOpen}
        onClose={toggleSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: 400,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 400,
            boxSizing: "border-box",
            top: "64px", // AppBar height
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem>Home</ListItem>
          <ListItem>Starred</ListItem>
          <ListItem>Shared</ListItem>
          <ListItem>Workspaces</ListItem>
        </List>
      </Drawer>
    </div>
  )
}