interface BadgeProps {
  scope: "National" | "State" | "Local";
  className?: string;
}

const scopeStyles: Record<BadgeProps["scope"], string> = {
  National: "bg-gray-100 text-gray-700",
  State: "bg-blue-100 text-blue-700",
  Local: "bg-green-100 text-green-700",
};

export function Badge({ scope, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${scopeStyles[scope]} ${className}`}
    >
      {scope}
    </span>
  );
}
