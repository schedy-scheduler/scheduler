import { useMemo } from "react";
import { Skeleton } from "./ui/skeleton";

interface IAvatarProps {
  src?: string;
  name: string;
  isLoading?: boolean;
}

export const Avatar: React.FC<IAvatarProps> = ({
  src,
  name,
  isLoading = false,
}) => {
  const prefix = useMemo(() => {
    if (!name) return "";
    let namePrefix = "";
    const splitedName = name.split(" ");
    if (splitedName.length === 1) {
      namePrefix = splitedName[0][0];
    }
    namePrefix = splitedName[0][0] + " " + splitedName[1][0];
    return namePrefix.toUpperCase();
  }, [name]);

  if (isLoading) {
    return <Skeleton className="w-18 h-18 rounded-full" />;
  }

  if (!src) {
    return (
      <div className="flex items-center justify-center w-18 h-18 rounded-full bg-zinc-200 text-zinc-700 font-semibold text-xl border-2 border-white">
        {prefix}
      </div>
    );
  }

  return (
    <img
      src={src}
      className="w-18 h-18 rounded-full border-2 border-white bg-cover"
    />
  );
};
