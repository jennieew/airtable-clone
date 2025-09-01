"use client"

import { useState } from "react";
import { Box } from "@mui/material";
import Header from "../home_components/header";
import SideBar from "../home_components/sideBar";

export default function StarredPage() {
  const [sidebarOpen, setSideBarOpen] = useState(true);
  
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      <Header sidebarOpen={sidebarOpen} setSideBarOpen={setSideBarOpen} />
      <SideBar sidebarOpen={sidebarOpen} setSideBarOpen={setSideBarOpen}/>

      <Box 
        sx={{ 
          mt: "56px", p: 2,
          ml: sidebarOpen ? "300px" : "50px",
          flexShrink: 0,
          backgroundColor: "#f9fafc",
          flex: 1,
          px: "48px",
          py: "32px"
        }}
      >
        <h1 className="text-[1.7rem] leading-relaxed font-bold text-left pb-2.5 text-[#1c1c24]">Starred</h1>
      </Box>
    </div>
  )
}