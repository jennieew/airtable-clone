import { Avatar, Box, Button, Drawer, IconButton, Tooltip } from "@mui/material";
import { redirect } from "next/navigation";
import { useState } from "react";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { api } from "@/utils/api";
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ProfileMenu from "../base_components/profileMenu";

export default function BaseSideBar() {
  const [hovered, setHovered] = useState(false);

  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const handleCloseProfileMenu = () => {
    setProfileAnchor(null);
    setOpenProfileMenu(false);
  }
  const { data: user, isLoading } = api.user.getCurrentUser.useQuery();
  const firstInitial = user?.name ? user.name[0]!.toUpperCase() : "?";

  return (
    <Drawer
      variant="permanent"
      sx={{
        position: "absolute",
        zIndex: 3000,
        width: "56px",
        flexShrink: 0,
        p: "16px 8px",
        "& .MuiDrawer-paper": {
          width: "56px",
          boxSizing: "border-box",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: "16px 8px",
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

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          mt: "auto",
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
        </Button>
        <Tooltip
          title="Notifications"
          slotProps={{
            popper: {
              sx: {
                zIndex: 3100,
              }
            },
          }}
        >
          <IconButton
            sx={{
              color: "#45454a",
              width: 28,
              height: 28,
            }}
          >
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 18 }}/>
          </IconButton>
        </Tooltip>
        <Tooltip 
          title="Account"
          slotProps={{
            popper: {
              sx: {
                zIndex: 3100,
              }
            },
          }}
        >
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
    </Drawer>
  )
}