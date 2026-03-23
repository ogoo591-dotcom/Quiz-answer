export function HistoryItem({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded px-2 py-1.5 text-left text-base leading-6 hover:bg-gray-100 group-data-[collapsible=icon]:hidden"
      title={title}
    >
      {title}
    </button>
  );
}
