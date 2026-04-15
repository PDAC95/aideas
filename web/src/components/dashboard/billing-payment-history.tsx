interface BillingPaymentHistoryProps {
  totalMonthlyCents: number;
  translations: {
    title: string;
    date: string;
    amount: string;
    status: string;
    method: string;
    paid: string;
    pending: string;
  };
}

export function BillingPaymentHistory({
  totalMonthlyCents,
  translations,
}: BillingPaymentHistoryProps) {
  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);

  const now = new Date();
  const mockHistory: Array<{ date: Date; status: "pending" | "paid" }> = [
    { date: new Date(now.getFullYear(), now.getMonth(), 1), status: "pending" },
    { date: new Date(now.getFullYear(), now.getMonth() - 1, 1), status: "paid" },
    { date: new Date(now.getFullYear(), now.getMonth() - 2, 1), status: "paid" },
    { date: new Date(now.getFullYear(), now.getMonth() - 3, 1), status: "paid" },
  ];

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);

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
                {translations.date}
              </th>
              <th className="text-left text-sm text-gray-500 font-medium pb-3 px-2">
                {translations.amount}
              </th>
              <th className="text-left text-sm text-gray-500 font-medium pb-3 px-2">
                {translations.status}
              </th>
              <th className="text-left text-sm text-gray-500 font-medium pb-3 px-2">
                {translations.method}
              </th>
            </tr>
          </thead>
          <tbody>
            {mockHistory.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 last:border-0">
                <td className="py-3 px-2 text-sm text-gray-900">
                  {formatDate(row.date)}
                </td>
                <td className="py-3 px-2 text-sm text-gray-900">
                  {formatCurrency(totalMonthlyCents)}
                </td>
                <td className="py-3 px-2 text-sm">
                  {row.status === "paid" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {translations.paid}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {translations.pending}
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-sm text-gray-600">**** 4242</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
