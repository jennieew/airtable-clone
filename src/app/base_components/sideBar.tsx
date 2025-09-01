import { Button, Drawer } from "@mui/material";
import { redirect } from "next/navigation";

export default function BaseSideBar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: "60px",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: "60px",
          boxSizing: "border-box",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Button onClick={() => redirect('/home')}>back</Button>
    </Drawer>
  )
}