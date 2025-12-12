interface Props {
  title: string;
}

export function HistoryItem({ title }: Props) {
  return (
    <div className="text-[15px] text-black hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
      {title}
    </div>
  );
}
