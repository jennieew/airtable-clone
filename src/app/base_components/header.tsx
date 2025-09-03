import { Box, Button, Menu, MenuItem, TextField } from "@mui/material";
import type { Base } from "@prisma/client";
import React, { useState } from "react";
import { api } from "@/utils/api";

type BaseCardProps = {
  base: Base;
};

export default function BaseHeader({ base }: BaseCardProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [value, setValue] = useState(base.name);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const utils = api.useUtils();
  const editBase = api.base.editBase.useMutation({
    onMutate: async ({ baseId, name }) => {
      if (!name) return;
      
      await utils.base.getBase.cancel({ baseId })
      const previousBase = utils.base.getBase.getData({ baseId });

      utils.base.getBase.setData({ baseId }, (old) => old ? { ...old, name } : old);

      return { previousBase };
    },
    onError: (err, variables, context) => {
      if (context?.previousBase) {
        utils.base.getBase.setData({ baseId: context.previousBase.baseId }, context.previousBase);
      }
    },
    onSettled: () => {
      utils.base.getBase.invalidate({ baseId: base.baseId })
    }
  });

  const handleRenameBase = async () => {
    if (value.trim() && value !== base.name) {
      await editBase.mutateAsync({
        baseId: base.baseId,
        name: value.trim()
      })
    }
    handleClose();
  };

  return (
    <Box 
      className="flex items-center pl-[60px]"
      sx={{ pl: "60px", borderBottom: "1px solid rgba(0,0,0,0.1)" }}
    >
      <img src="/default_base_image.png" alt="default base image"/>
      <Button
        id="menu-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        sx={{
          fontWeight: "bold"
        }}
      >{base.name}</Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': "menu-button",
          },
        }}
      >
        <MenuItem disableRipple>
          <TextField
            variant="standard"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            slotProps={{
              input: {
                disableUnderline: true
              }
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                e.preventDefault();
                handleRenameBase();
              }
            }}
            onBlur={handleRenameBase}
          />
        </MenuItem>
        <MenuItem>Appearance</MenuItem>
        <MenuItem>Base Guide</MenuItem>
      </Menu>
    </Box>
  )
}