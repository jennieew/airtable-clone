import { Box } from "@mui/material";
import type { Base } from "@prisma/client";

type BaseCardProps = {
  base: Base;
};

export default function BaseHeader({ base }: BaseCardProps) {
  return (
    <Box 
      className="flex items-center pl-[60px]"
      sx={{ pl: "60px", borderBottom: "1px solid rgba(0,0,0,0.1)" }}
    >
      <img src="/default_base_image.png" alt="default base image"/>
      <h1>{base.name}</h1>
    </Box>
  )
}