import type { CSSProperties } from "react";

import { SidebarInset, SidebarProvider } from "@/components/cn-ui/sidebar";
import { AppSidebar } from "@/components/shadcn-examples/dashboard/components/app-sidebar";
import { SiteHeader } from "@/components/shadcn-examples/dashboard/components/site-header";
import { AnalyticsHome } from "@/components/shadcn-examples/dashboard/analytics/analytics-home";

export default function Page() {
  return (
    <div data-testid="dashboard-analytics-demo">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 64)",
            "--header-height": "calc(var(--spacing) * 12 + 1px)",
          } as CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Documents" />
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="@container/main flex min-h-0 flex-1 flex-col gap-2">
              <AnalyticsHome />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
