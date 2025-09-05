import { Button, Menu, MenuItem } from "@mui/material"

type filterMenuProps = {
  openFilterMenu: boolean;
  filterAnchor: HTMLElement | null;
  onClose: () => void;
  viewId: string;
};

export default function FilterMenu({ openFilterMenu, filterAnchor, onClose, viewId }: filterMenuProps) {
  // get view
  
  return (
    <Menu
      anchorEl={filterAnchor}
      open={openFilterMenu}
      onClose={onClose}
    >
      <MenuItem disableRipple disableTouchRipple>No filter conditions are applied</MenuItem>
      <MenuItem 
        disableRipple disableTouchRipple
        sx={{display: "flex"}}
      >
        <Button
          sx={{
            textTransform: "none",
            color: "black",
          }}
        >+ Add condition</Button>
        <Button
          sx={{
            textTransform: "none",
            color: "black",
          }}  
        >+ Add condition group</Button>
      </MenuItem>
    </Menu>
  )
}