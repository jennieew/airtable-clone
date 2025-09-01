import { Box, Card, IconButton } from "@mui/material";
import type { Base } from "@prisma/client";
import React, { useState } from "react";
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";

type BaseCardProps = {
  base: Base;
};

export default function BaseCard({ base }: BaseCardProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  const utils = api.useUtils();
  const deleteBase = api.base.deleteBase.useMutation({
    onSuccess: async () => {
      await utils.base.getUserBases.invalidate();
    }
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBase.mutate({ baseId: base.baseId });
  };

  const handleClickCard = () => {
    router.push(`/base/${base.baseId}`);
  };
  
  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        position: "relative",
        p: 1.5,
        mb: 2,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClickCard}
    >
      <img 
        src="/default_base_image.png" 
        alt="default base image"
        style={{ width: 60, height: 60, borderRadius: 4, marginRight: 16 }}
      />
      <Box sx={{ flexGrow: 1 }}>
        <h1 style={{fontWeight: 500}}>{base.name}</h1>
        <h2 style={{ fontSize: "1rem", fontWeight: 400, color: "#999", margin: 0 }}>
          {hovered ? "Open data" : "Last opened time"}
        </h2>
      </Box>
      
      {hovered && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            gap: 1,
          }}
        >
          <IconButton>
            <StarBorderRoundedIcon />
          </IconButton>
          <IconButton>
            <MoreHorizRoundedIcon />
          </IconButton>
          <IconButton onClick={handleDelete}>
            <DeleteOutlineRoundedIcon/>
          </IconButton>
        </Box>
      )}
    </Card>
  )
}