import { IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar() {
  return (
    <TextField
      variant="outlined"
      placeholder="Search..."
      size="small"
      sx={{ width: 300 }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <IconButton>
                <SearchIcon/>
              </IconButton>
            </InputAdornment>
          )
        }
      }}
    />
  );
}