import { Button, Menu, MenuItem } from "@mui/material"

type sortMenuProps = {
  openSortMenu: boolean;
  sortAnchor: HTMLElement | null;
  onClose: () => void;
  viewId: string;
};

export default function SortMenu({ openSortMenu, sortAnchor, onClose, viewId }: sortMenuProps) {
  // get view
  
  return (
    <Menu
      anchorEl={sortAnchor}
      open={openSortMenu}
      onClose={onClose}
    >
      <MenuItem disableRipple disableTouchRipple>Sort by</MenuItem>
    </Menu>
  )
}