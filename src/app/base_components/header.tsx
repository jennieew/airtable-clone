import type { Base } from "@prisma/client";

type BaseCardProps = {
  base: Base;
};

export default function BaseHeader({ base }: BaseCardProps) {
  return (
    <div className="flex items-center pl-[60px]">
      <img src="/default_base_image.png" alt="default base image"/>
      <h1>{base.name}</h1>
    </div>
  )
}