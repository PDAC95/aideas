"use client";

import { useState, useEffect } from "react";

interface CatalogRequestButtonProps {
  label: string;
  toastMessage: string;
}

export function CatalogRequestButton({ label, toastMessage }: CatalogRequestButtonProps) {
  const [isRequested, setIsRequested] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showToast]);

  function handleClick() {
    if (isRequested) return;
    setIsRequested(true);
    setShowToast(true);
    // Re-enable button after 3 seconds
    setTimeout(() => setIsRequested(false), 3000);
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isRequested}
        className="inline-flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition-colors"
      >
        {label}
      </button>

      {/* Simple toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}
    </>
  );
}
