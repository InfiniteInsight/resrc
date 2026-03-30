import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
  border?: boolean;
  shadow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { padding = true, border = true, shadow = true, className = "", ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg ${padding ? "p-4 sm:p-6" : ""} ${
          border ? "border border-border" : ""
        } ${shadow ? "shadow-sm" : ""} ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
export { Card };
export type { CardProps };
