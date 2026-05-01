import { SidebarInset, SidebarProvider } from "@/components/cn-ui/sidebar";
import { AppSidebar } from "@/components/shadcn-examples/dashboard/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/shadcn-examples/dashboard/components/chart-area-interactive";
import { DataTable } from "@/components/shadcn-examples/dashboard/components/data-table";
import { SectionCards } from "@/components/shadcn-examples/dashboard/components/section-cards";
import { SiteHeader } from "@/components/shadcn-examples/dashboard/components/site-header";

import data from "./data.json";

export default function Page() {
  return (
    <div data-testid="dashboard-demo">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 64)",
            "--header-height": "calc(var(--spacing) * 12 + 1px)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={data} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
