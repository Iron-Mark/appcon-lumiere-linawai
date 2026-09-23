import { Suspense } from "react";

import { AccountScreen } from "@/components/auth/AccountScreen";

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <p className="font-ui px-5 py-10 text-sm text-ink-muted">Loading…</p>
      }
    >
      <AccountScreen />
    </Suspense>
  );
}
