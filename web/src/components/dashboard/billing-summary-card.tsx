"use client";

import { useState, useEffect } from "react";

interface BillingSummaryCardProps {
  totalMonthlyCents: number;
  activeCount: number;
  nextChargeDate: string | null;
  translations: {
    title: string;
    totalCharge: string;
    activeAutomations: string;
    nextCharge: string;
    managePayment: string;
    toastMessage: string;
  };
}

export function BillingSummaryCard({
  totalMonthlyCents,
  activeCount,
  nextChargeDate,
  translations,
}: BillingSummaryCardProps) {
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!toastVisible) return;
    const timer = setTimeout(() => setToastVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalMonthlyCents / 100);

  const formattedDate = nextChargeDate
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(nextChargeDate))
    : "—";

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {translations.title}
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{translations.totalCharge}</span>
            <span className="text-sm font-bold text-gray-900">{formattedTotal}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{translations.activeAutomations}</span>
            <span className="text-sm font-medium text-gray-900">{activeCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{translations.nextCharge}</span>
            <span className="text-sm font-medium text-gray-900">{formattedDate}</span>
          </div>
        </div>

        <button
          onClick={() => setToastVisible(true)}
          className="mt-5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium w-full transition-colors"
        >
          {translations.managePayment}
        </button>
      </div>

      {toastVisible && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm">
          {translations.toastMessage}
        </div>
      )}
    </>
  );
}
