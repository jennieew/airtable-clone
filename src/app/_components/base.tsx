import { Box, Card, IconButton } from "@mui/material";
import type { Base } from "@prisma/client";
import { useState } from "react";
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

type BaseCardProps = {
  base: Base;
};

export default function BaseCard({ base }: BaseCardProps) {
  const [hovered, setHovered] = useState(false);
  
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
        </Box>
      )}
    </Card>
  )
}