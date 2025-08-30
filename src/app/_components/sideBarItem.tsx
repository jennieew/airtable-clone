import { ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { type SvgIconComponent } from "@mui/icons-material";

interface SidebarItemProps {
  icon: SvgIconComponent;
  label: string;
  sidebarOpen: boolean;
  onClick?: () => void;
}

export default function SidebarItem({ icon: Icon, label, sidebarOpen, onClick }: SidebarItemProps) {
  return (
    <ListItem disablePadding>
      <ListItemButton
        sx={{
          justifyContent: "flex-start",
          pl:"10px",
        }}
        onClick={onClick}
      >
        <ListItemIcon>
          <Icon sx={{ fontSize: 25 }} />
        </ListItemIcon>
        {sidebarOpen && <ListItemText primary={label} />}
      </ListItemButton>
    </ListItem>
  );
}