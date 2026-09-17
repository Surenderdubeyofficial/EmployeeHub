import React from "react";

export default function Card({
  children,
  title,
  subtitle,
  action,
  className = "",
  bodyClassName = "",
  headerClassName = "",
  footer,
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}
    >
      {(title || subtitle || action) && (
        <div
          className={`flex items-center justify-between border-b border-slate-100 px-6 py-4.5 ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3.5">
          {footer}
        </div>
      )}
    </div>
  );
}
