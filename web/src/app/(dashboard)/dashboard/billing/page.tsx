import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getOrgId, fetchBillingData } from "@/lib/dashboard/queries";
import { BillingSummaryCard } from "@/components/dashboard/billing-summary-card";
import { BillingChargesTable } from "@/components/dashboard/billing-charges-table";
import { BillingPaymentHistory } from "@/components/dashboard/billing-payment-history";

export default async function BillingPage() {
  // Auth guard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const orgId = await getOrgId(user.id);
  if (!orgId) {
    redirect("/login");
  }

  const [data, t] = await Promise.all([
    fetchBillingData(orgId),
    getTranslations("dashboard.billing"),
  ]);

  // Empty state — no active automations
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t("empty.title")}
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          {t("empty.message")}
        </p>
        <Link
          href="/dashboard/automations"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {t("empty.cta")}
        </Link>
      </div>
    );
  }

  const summaryTranslations = {
    title: t("summary.title"),
    totalCharge: t("summary.totalCharge"),
    activeAutomations: t("summary.activeAutomations"),
    nextCharge: t("summary.nextCharge"),
    managePayment: t("summary.managePayment"),
    toastMessage: t("summary.toastMessage"),
  };

  const chargesTranslations = {
    title: t("charges.title"),
    automation: t("charges.automation"),
    plan: t("charges.plan"),
    monthlyCharge: t("charges.monthlyCharge"),
    total: t("charges.total"),
  };

  const historyTranslations = {
    title: t("history.title"),
    date: t("history.date"),
    amount: t("history.amount"),
    status: t("history.status"),
    method: t("history.method"),
    paid: t("history.paid"),
    pending: t("history.pending"),
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>

      <BillingSummaryCard
        totalMonthlyCents={data.totalMonthlyCents}
        activeCount={data.activeCount}
        nextChargeDate={data.nextChargeDate}
        translations={summaryTranslations}
      />

      <BillingChargesTable
        automations={data.automations}
        translations={chargesTranslations}
      />

      <BillingPaymentHistory
        totalMonthlyCents={data.totalMonthlyCents}
        translations={historyTranslations}
      />
    </div>
  );
}
