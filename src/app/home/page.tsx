"use client" 

import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
import { Box, CircularProgress, Grid } from "@mui/material";
import Header from "../_components/header";
import SideBar from "../_components/sideBar";
import { api } from "@/trpc/react";
import BaseCard from "../_components/base";

export default function DashboardPage() {
  const [sidebarOpen, setSideBarOpen] = useState(true);

  // const { data: session, status } = useSession();
  // const router = useRouter();

  // useEffect(() => {
  //   if (status === "loading") return;
  //   if (!session) router.push("/signin");
  // }, [session, status, router]);

  // if (status === "loading" || !session) return <div>Loading...</div>;

  // return (
  //   <div className="p-8">
  //     <h1 className="text-3xl font-bold">Dashboard</h1>
  //     <p>Welcome, {session.user?.name}!</p>
  //   </div>
  // );

  const { data, isLoading, error } = api.base.getUserBases.useQuery();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      <Header sidebarOpen={sidebarOpen} setSideBarOpen={setSideBarOpen} />
      <SideBar sidebarOpen={sidebarOpen} setSideBarOpen={setSideBarOpen}/>

      <Box 
        sx={{ 
          mt: "56px", p: 2,
          ml: sidebarOpen ? "300px" : "50px",
          flexShrink: 0,
          backgroundColor: "#f9fafc",
          flex: 1,
          px: "48px",
          py: "32px"
        }}
      >
        <h1 className="text-[1.7rem] leading-relaxed font-bold text-left pb-2.5 text-[#1c1c24]">Home</h1>
        <div>
          {isLoading && <CircularProgress />} 
          {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
          {data && (
            <Grid container spacing={2}>
              {data.map((base) => (
                <Grid size={{ xs: 12, sm : 6, md: 4, lg: 3 }} key={base.baseId}>
                  <BaseCard base={base} />
                </Grid>
              ))}
            </Grid>
          )}
        </div>
      </Box>
    </div>
  )
}