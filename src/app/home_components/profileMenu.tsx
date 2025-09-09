import type { RouterOutputs } from "@/trpc/react";
import { Box, Divider, Menu, MenuItem, Typography } from "@mui/material";
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import StarsOutlinedIcon from '@mui/icons-material/StarsOutlined';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { signOut } from "next-auth/react";

type CurrentUser = RouterOutputs["user"]["getCurrentUser"];

interface ProfileMenuProps {
  openProfileMenu: boolean;
  profileAnchor: HTMLElement | null;
  onClose: () => void;
  user: CurrentUser;
}

export default function ProfileMenu({ openProfileMenu, profileAnchor, onClose, user }: ProfileMenuProps) {
  if (!user) return null;
  
  return (
    <Menu
      open={openProfileMenu}
      anchorEl={profileAnchor}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            // height: 556,
            width: 296,
            padding: "12px",
            borderRadius: 2,
          },
        },
        list: {
          sx: {
            padding: 0,
          }
        }
      }}
    >
      <Box 
        sx={{ 
          marginLeft: "8px", 
          marginBottom: "8px", 
          paddingBottom: "16px", 
          paddingTop: "8px",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: "13px" }}>
          {user.name}
        </Typography>
        <Typography sx={{ fontSize: "13px" }}>
          {user.email}
        </Typography>
      </Box>

      <MenuItem sx={{ fontSize: "13px", padding: "8px" }}>
        <PersonOutlineOutlinedIcon sx={{ height: "16px", width: "16px", transform: "translateY(-1px)", mr: 1 }}/>
        Account
      </MenuItem>
      <MenuItem sx={{ fontSize: "13px", padding: "8px" }}>
        <PeopleOutlinedIcon sx={{ height: "16px", width: "16px", transform: "translateY(-1px)", mr: 1 }}/>
        Manage groups
      </MenuItem>
      <MenuItem sx={{ fontSize: "13px", padding: "8px" }}>
        <NotificationsNoneOutlinedIcon sx={{ height: "16px", width: "16px", transform: "translateY(-1px)", mr: 1 }}/>
        Notification preferences
      </MenuItem>
      <MenuItem sx={{ fontSize: "13px", padding: "8px" }}>
        <TranslateOutlinedIcon sx={{ height: "16px", width: "16px", transform: "translateY(-1px)", mr: 1 }}/>
        Language preferences
      </MenuItem>
      <MenuItem sx={{ fontSize: "13px", padding: "8px" }}>
        <PaletteOutlinedIcon sx={{ height: "16px", width: "16px", transform: "translateY(-1px)", mr: 1 }}/>
        Appearance
      </MenuItem>
      <Divider sx={{ margin: "8px", borderColor: "rgba(0,0,0,0.05)", mr: 1 }}/>

      <MenuItem sx={{ fontSize: "13px", padding: "8px" }}>
        <EmailOutlinedIcon sx={{ height: "16px", width: "16px", transform: "translateY(-1px)", mr: 1 }}/>
        Contact sales
      </MenuItem>
      <MenuItem sx={{ fontSize: "13px", padding: "8px" }}>
        <StarsOutlinedIcon sx={{ height: "16px", width: "16px", transform: "translateY(-1px)", mr: 1 }}/>
        Upgrade
      </MenuItem>
      <MenuItem sx={{ fontSize: "13px", padding: "8px" }}>
        <EmailOutlinedIcon sx={{ height: "16px", width: "16px", transform: "translateY(-1px)", mr: 1 }}/>
        Tell a friend
      </MenuItem>
      <Divider sx={{ margin: "8px", borderColor: "rgba(0,0,0,0.05)" }}/>

      <MenuItem sx={{ fontSize: "13px", padding: "8px" }}>
        <InsertLinkOutlinedIcon sx={{ height: "16px", width: "16px", transform: "translateY(-1px)", mr: 1 }}/>
        Integrations
      </MenuItem>
      <MenuItem sx={{ fontSize: "13px", padding: "8px" }}>
        <BuildOutlinedIcon sx={{ height: "16px", width: "16px", transform: "translateY(-1px)", mr: 1 }}/>
        Builder hub
      </MenuItem>
      <Divider sx={{ margin: "8px", borderColor: "rgba(0,0,0,0.05)" }}/>

      <MenuItem sx={{ fontSize: "13px", padding: "8px" }}>
        <DeleteOutlineOutlinedIcon sx={{ height: "16px", width: "16px", transform: "translateY(-1px)", mr: 1 }}/>
        Trash
      </MenuItem>
      <MenuItem 
        sx={{ fontSize: "13px", padding: "8px" }}
        onClick={async () => signOut({ callbackUrl: '/' })}
      >
        <LogoutOutlinedIcon sx={{ height: "16px", width: "16px", transform: "translateY(-1px)", mr: 1 }}/>
        Log Out
      </MenuItem>
      
    </Menu>
  )
}