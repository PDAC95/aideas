import type { BillingAutomation } from "@/lib/dashboard/types";

interface BillingChargesTableProps {
  automations: BillingAutomation[];
  translations: {
    title: string;
    automation: string;
    plan: string;
    monthlyCharge: string;
    total: string;
  };
}

export function BillingChargesTable({
  automations,
  translations,
}: BillingChargesTableProps) {
  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);

  const totalCents = automations.reduce((sum, a) => sum + a.monthlyPrice, 0);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {translations.title}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-sm text-gray-500 font-medium pb-3 px-2">
                {translations.automation}
              </th>
              <th className="text-left text-sm text-gray-500 font-medium pb-3 px-2">
                {translations.plan}
              </th>
              <th className="text-right text-sm text-gray-500 font-medium pb-3 px-2">
                {translations.monthlyCharge}
              </th>
            </tr>
          </thead>
          <tbody>
            {automations.map((automation) => (
              <tr key={automation.id} className="border-b border-gray-100 last:border-0">
                <td className="py-3 px-2 text-sm text-gray-900">{automation.name}</td>
                <td className="py-3 px-2 text-sm text-gray-600">{automation.planLabel}</td>
                <td className="py-3 px-2 text-sm text-gray-900 text-right">
                  {formatCurrency(automation.monthlyPrice)}
                </td>
              </tr>
            ))}
            {/* Totals row */}
            <tr className="border-t border-gray-200">
              <td colSpan={2} className="py-3 px-2 text-sm font-bold text-gray-900">
                {translations.total}
              </td>
              <td className="py-3 px-2 text-sm font-bold text-gray-900 text-right">
                {formatCurrency(totalCents)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
