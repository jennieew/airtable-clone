import { Box, Card, Divider, IconButton, Menu, MenuItem } from "@mui/material";
import type { Base } from "@prisma/client";
import React, { useState } from "react";
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";

import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import EastOutlinedIcon from '@mui/icons-material/EastOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BrushOutlinedIcon from '@mui/icons-material/BrushOutlined';

type BaseCardProps = {
  base: Base;
};

export default function BaseCard({ base }: BaseCardProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const utils = api.useUtils();
  const deleteBase = api.base.deleteBase.useMutation({
    onSuccess: async () => {
      await utils.base.getUserBases.invalidate();
    }
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBase.mutate({ baseId: base.baseId });
    setAnchorEl(null);
  };

  const handleClickCard = () => {
    router.push(`/base/${base.baseId}`);
  };
  
  return (
    <>
      <Card
        sx={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          p: 2,
          mb: 2,
          borderRadius: 2,
          border: "1px solid rgba(0,0,0,0.1)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClickCard}
      >
        <Box
          sx={{
            width: 55,
            height: 55,
            borderRadius: 3,
            backgroundColor: "#634a8e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 2,
            color: "#fff",
            fontWeight: 400,
            fontSize: "1.2rem",
          }}
        >
          {base.name.slice(0, 2)}
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <h1 style={{fontWeight: 500, fontSize: "13px"}}>{base.name}</h1>
          <h2 style={{ fontSize: "11px", fontWeight: 400, color: "#999", margin: 0 }}>
            {hovered ? "Open data" : "Last opened time"}
          </h2>
        </Box>
        
        {hovered && (
          <Box
            sx={{
              // position: "absolute",
              top: 8,
              right: 8,
              display: "flex",
              gap: 1,
            }}
          >
            <IconButton
              onClick={(e) => e.stopPropagation()}
            >
              <StarBorderRoundedIcon />
            </IconButton>
            <div>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setAnchorEl(e.currentTarget);
                }}
              >
                <MoreHorizRoundedIcon />
              </IconButton>
            </div>
          </Box>
        )}
      </Card>

      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              padding: "12px",
              borderRadius: 2,
            },
          }
        }}
        // anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        // transformOrigin={{ vertical: "top", horizontal: "right" }}
        // disablePortal 
      >
        <MenuItem>
          <ModeEditOutlinedIcon sx={{ fontSize: "16px", mr: 1 }}/>
          Rename
        </MenuItem>
        <MenuItem>
          <ContentCopyOutlinedIcon sx={{ fontSize: "16px", mr: 1 }}/>
          Duplicate
        </MenuItem>
        <MenuItem>
          <EastOutlinedIcon sx={{ fontSize: "16px", mr: 1 }}/>
          Move
        </MenuItem>
        <MenuItem>
          <GroupsOutlinedIcon sx={{ fontSize: "16px", mr: 1 }}/>
          Go to workspace
        </MenuItem>
        <MenuItem>
          <BrushOutlinedIcon sx={{ fontSize: "16px", mr: 1 }}/>
          Customize appearance
        </MenuItem>
        <Divider/>
        <MenuItem onClick={handleDelete}>
          <DeleteOutlineRoundedIcon sx={{ fontSize: "16px", mr: 1 }}/>
          Delete
        </MenuItem>
      </Menu>
    </>
  )
}