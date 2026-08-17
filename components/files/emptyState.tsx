"use client";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export default function EmptyState({ title, description, actionLabel, onAction, icon = "📂" }: EmptyStateProps) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
      {/* Icon */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">{icon}</div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

      {/* Description */}
      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">{description}</p>

      {/* Action */}
      {actionLabel && onAction && (
        <button onClick={onAction} className="mt-6 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
