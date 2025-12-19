"use client";

interface Props {
  title: string;
  onClick: () => void;
}

export function HistoryItem({ title, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="text-[15px] text-black hover:bg-gray-100 px-2 py-2 rounded cursor-pointer"
    >
      {title}
    </div>
  );
}
