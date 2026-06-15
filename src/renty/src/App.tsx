import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { SubscriptionRequiredModal } from "./features/subscription/SubscriptionRequiredModal";
import { PlaceholderPage } from "./pages/PlaceholderPage";

const SignInPage = lazy(() => import("./pages/auth/SignInPage").then((module) => ({ default: module.SignInPage })));
const SignUpPage = lazy(() => import("./pages/auth/SignUpPage").then((module) => ({ default: module.SignUpPage })));
const ChannelsPage = lazy(() => import("./pages/channels/ChannelsPage").then((module) => ({ default: module.ChannelsPage })));
const HomePage = lazy(() => import("./pages/home/HomePage").then((module) => ({ default: module.HomePage })));
const LeaseDetailPage = lazy(() => import("./pages/leases/LeaseDetailPage").then((module) => ({ default: module.LeaseDetailPage })));
const LeasesPage = lazy(() => import("./pages/leases/LeasesPage").then((module) => ({ default: module.LeasesPage })));
const PropertiesPage = lazy(() => import("./pages/properties/PropertiesPage").then((module) => ({ default: module.PropertiesPage })));
const PropertyDetailPage = lazy(() => import("./pages/properties/PropertyDetailPage").then((module) => ({ default: module.PropertyDetailPage })));
const PropertyVaultPage = lazy(() => import("./pages/properties/PropertyVaultPage").then((module) => ({ default: module.PropertyVaultPage })));
const RentReceiptDetailPage = lazy(() => import("./pages/rent-receipts/RentReceiptDetailPage").then((module) => ({ default: module.RentReceiptDetailPage })));
const RentReceiptsPage = lazy(() => import("./pages/rent-receipts/RentReceiptsPage").then((module) => ({ default: module.RentReceiptsPage })));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const TenantsPage = lazy(() => import("./pages/tenants/TenantsPage").then((module) => ({ default: module.TenantsPage })));

function PageLoader() {
  return (
    <div className="min-h-[320px] w-full flex items-center justify-center text-sm text-muted-foreground">
      Loading...
    </div>
  );
}

function AuthenticatedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider defaultOpen>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:border focus:border-border focus:rounded-md focus:text-sm focus:font-medium focus:shadow-md"
      >
        Skip to main content
      </a>
      <AppSidebar />
      <main id="main-content" className="w-full min-w-0">
        <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b bg-background/95 backdrop-blur-sm px-3 md:hidden">
          <SidebarTrigger />
          <span className="font-semibold text-sm font-display">Renty</span>
        </header>
        <div className="hidden md:block">
          <SidebarTrigger />
        </div>
        <SubscriptionRequiredModal hasSubscription />
        {children}
      </main>
    </SidebarProvider>
  );
}

function AuthGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const location = useLocation();
  const { data, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!data?.session) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Routes>
        <Route path="/sign-in" element={<Suspense fallback={<PageLoader />}><SignInPage /></Suspense>} />
        <Route path="/sign-up" element={<Suspense fallback={<PageLoader />}><SignUpPage /></Suspense>} />
        <Route
          path="*"
          element={
            <AuthGate>
              <AuthenticatedLayout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route
                      path="/"
                      element={<HomePage />}
                    />
                    <Route path="/properties" element={<PropertiesPage />} />
                    <Route path="/properties/:id" element={<PropertyDetailPage />} />
                    <Route path="/properties/:id/vault" element={<PropertyVaultPage />} />
                    <Route path="/tenants" element={<TenantsPage />} />
                    <Route path="/leases" element={<LeasesPage />} />
                    <Route path="/leases/:id" element={<LeaseDetailPage />} />
                    <Route path="/rent-receipts" element={<RentReceiptsPage />} />
                    <Route path="/rent-receipts/:id" element={<RentReceiptDetailPage />} />
                    <Route path="/channels" element={<ChannelsPage />} />
                    <Route path="/channels/:id" element={<ChannelsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<PlaceholderPage title="Not found" description="This route has not been ported yet." />} />
                  </Routes>
                </Suspense>
              </AuthenticatedLayout>
            </AuthGate>
          }
        />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}
