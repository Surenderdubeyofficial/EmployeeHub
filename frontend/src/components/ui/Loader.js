import React from "react";

export default function Loader({
  size = "md",
  message = "Loading...",
  fullScreen = false,
  className = "",
}) {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-slate-200 border-t-blue-600 ${
          sizeClasses[size] || sizeClasses.md
        }`}
      />
      {message && (
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
}
