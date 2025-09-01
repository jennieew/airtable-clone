"use client"; // only needed if you use client hooks

import BaseHeader from "@/app/base_components/header";
import BaseSideBar from "@/app/base_components/sideBar";
import { useParams } from "next/navigation";
import { api } from "@/utils/api";

export default function BasePage() {
  const params = useParams();
  const baseId = params.baseId as string;

  // get base
  const { data: base, isLoading } = api.base.getBase.useQuery({ baseId });

  if (isLoading) return <p>Loading...</p>;
  if (!base) return <p>Base not found</p>;

  return (
    <div>
      <BaseSideBar/>
      <BaseHeader base={base}/>
      <h1 className="p-[60px]">Here is the base for: {baseId}</h1>
    </div>
  );
}