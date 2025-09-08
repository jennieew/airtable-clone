import { Button, Drawer, IconButton, Tooltip } from "@mui/material";
import { redirect } from "next/navigation";
import { useState } from "react";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

export default function BaseSideBar() {
  const [hovered, setHovered] = useState(false);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: "56px",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: "56px",
          boxSizing: "border-box",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 2,
        },
      }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered ? (
          <Tooltip title={"Back to home"} placement="right">
            <IconButton 
              onClick={() => redirect('/home')}
            >
              <KeyboardBackspaceIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
        ) : (
          <img 
            src="/airtable-logo-bnw.svg" 
            alt="black and white airtable logo"
            className="w-[23px] h-[23px]"
          />
        )}
      </div>
    </Drawer>
  )
}