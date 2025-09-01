"use client"; // only needed if you use client hooks

import { useParams } from "next/navigation";

export default function BasePage() {
  const params = useParams();
  const baseId = params.baseId;

  return (
    <div>
      <h1>Here is the base for: {baseId}</h1>
    </div>
  );
}