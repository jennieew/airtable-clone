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
    <ListItem disablePadding sx={{ paddingLeft: "12px", marginBottom: "4px" }}>
      <ListItemButton
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
          padding: "8px"
        }}
        onClick={onClick}
      >
        <Icon sx={{ fontSize: 20, flexShrink: 0, mr: 1 }} />
        {sidebarOpen && <ListItemText primary={label} sx={{ fontSize: "15px" }}/>}
      </ListItemButton>
    </ListItem>
  );
}