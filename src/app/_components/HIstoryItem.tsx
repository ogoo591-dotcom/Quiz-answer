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
      className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 group-data-[collapsible=icon]:hidden"
      title={title}
    >
      {title}
    </button>
  );
}
