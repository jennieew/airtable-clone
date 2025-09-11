import { Skeleton } from "@/components/ui/skeleton";
import { Box } from "@mui/material"; // optional, just for layout

export function LoadingTable() {
  return (
    <Box className="w-full border rounded-md overflow-hidden">
      {/* Table Header Skeleton */}
      <Box className="flex border-b bg-gray-50">
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} className="flex-1 p-2">
            <Skeleton className="h-4 w-full" />
          </Box>
        ))}
      </Box>

      {/* Table Rows Skeleton */}
      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <Box key={rowIndex} className="flex border-b last:border-b-0">
          {Array.from({ length: 4 }).map((_, colIndex) => (
            <Box key={colIndex} className="flex-1 p-2">
              <Skeleton className="h-4 w-full" />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}