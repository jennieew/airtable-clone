import { IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar() {
  return (
    <TextField
      variant="outlined"
      placeholder="Search..."
      size="small"
      sx={{ 
        width: "20vw",
        px: "16px",
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <IconButton>
                <SearchIcon/>
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            borderRadius: 5,
            height: "32px",
          }
        }
      }}
    />
  );
}