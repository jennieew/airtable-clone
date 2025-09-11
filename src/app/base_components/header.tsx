import { Box, Button, Divider, Menu, MenuItem, TextField } from "@mui/material";
import type { Base } from "@prisma/client";
import React, { useState } from "react";
import { api } from "@/utils/api";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';

type BaseCardProps = {
  base: Base;
};

const buttonSx = {
  textTransform: "none",
  color: "#45454a",
  py: "16px",
  fontSize: "13px",
  px: 0,
  minWidth: 0,
}

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
      
      await utils.base.getBase.cancel({ baseId });
      const previousBase = utils.base.getBase.getData({ baseId });

      utils.base.getBase.setData({ baseId }, (old) => old ? { ...old, name } : old);

      return { previousBase };
    },
    onError: (err, variables, context) => {
      if (context?.previousBase) {
        utils.base.getBase.setData({ baseId: context.previousBase.baseId }, context.previousBase);
      }
    },
    onSettled: async () => {
      await utils.base.getBase.invalidate({ baseId: base.baseId });
      await utils.base.getUserBases.invalidate();
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
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 2000,
        width: "100%",
        pl: "56px", 
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "white",
      }}
    >
      <div className="flex">
        <img 
          src="/default_base_image.png" 
          alt="default base image"
          className="ml-[10px]"
        />
        <Button
          id="menu-button"
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          sx={{
            fontWeight: "bold",
            color: "text.primary",
            textTransform: "none",
            fontSize: "17px",
          }}
        >{base.name} <ExpandMoreIcon fontSize="small"/> </Button>
      </div>

      <div className="flex gap-3">
        <Button sx={buttonSx}>Data</Button>
        <Button sx={buttonSx}>Automations</Button>
        <Button sx={buttonSx}>Interfaces</Button>
        <Button sx={buttonSx}>Forms</Button>
      </div>

      <div className="flex gap-1">
        <Button 
          variant="outlined"
          sx={{
            border: "1px solid rgba(0,0,0,0.1)",
            height: "28px",
            py: 0,
            px: "10px",
            fontSize: "13px",
            textTransform: "none",
            color: "#45454a",
          }}
        >Launch</Button>
        <Button 
          variant="contained"
          sx={{
            backgroundColor: "#634a8e",
            height: "28px",
            py: 0,
            minWidth: 0,
            px: "10px",
            fontSize: "13px",
            textTransform: "none",
            boxShadow: "none",
            borderRadius: 1.5,
          }}
        >Share</Button>
      </div>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ // for shifting menu left and down
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          mt: 2,
          ml: -5.5,
        }}
        slotProps={{
          list: {
            'aria-labelledby': "menu-button",
            sx: {
              padding: 0,
            }
          },
          paper: {
            sx: {
              padding: "16px",
              borderRadius: 2,
              width: 400,
              maxHeight: "736px",
              fontSize: "13px",
            },
          }
        }}
      >
        <MenuItem disableRipple disableTouchRipple sx={{ padding: 0, pb: "8px", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
          <TextField
            variant="standard"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            slotProps={{
              htmlInput: {
                sx: {
                  padding: 0,
                }
              },
              input: {
                disableUnderline: true,
                sx: {
                  fontSize: "21px",
                  padding: "8px",
                }
              }
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                e.preventDefault();
                void handleRenameBase();
              }
            }}
            onBlur={void handleRenameBase}
          />
        </MenuItem>
        <MenuItem
          sx={{
            mt: "16px",
            px: "4px",
            pt: "4px",
            pb: "16px",
            fontSize: "17px",
            fontWeight: "bold",
            borderBottom: "1px solid rgba(0,0,0,0.1)",
          }}
        > <KeyboardArrowRightOutlinedIcon fontSize="small"/> Appearance</MenuItem>
        <MenuItem
          sx={{
            mt: "16px",
            p: "4px",
            fontSize: "17px",
            fontWeight: "bold",
          }}
        > <KeyboardArrowRightOutlinedIcon fontSize="small"/> Base Guide</MenuItem>
      </Menu>
    </Box>
  )
}