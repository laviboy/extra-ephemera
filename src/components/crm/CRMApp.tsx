import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import { supabaseDataProvider } from "../../lib/refine/dataProvider";
import { authProvider } from "../../lib/refine/authProvider";
import { supabaseLiveProvider } from "../../lib/refine/liveProvider";
import { QueryClient } from "@tanstack/react-query";

// CRM Pages
import { CRMDashboard } from "./pages/Dashboard";
import { ConversationList } from "./pages/conversations/List";
import { ConversationShow } from "./pages/conversations/Show";
import { BookingList } from "./pages/bookings/List";
import { BookingCreate } from "./pages/bookings/Create";
import { BookingEdit } from "./pages/bookings/Edit";
import { BookingShow } from "./pages/bookings/Show";
import { ProposalList } from "./pages/proposals/List";
import { ProposalCreate } from "./pages/proposals/Create";
import { ProposalEdit } from "./pages/proposals/Edit";
import { PackageList } from "./pages/packages/List";
import { PackageCreate } from "./pages/packages/Create";
import { PackageEdit } from "./pages/packages/Edit";
import { CRMLayout } from "./components/Layout";

const queryClient = new QueryClient();

export function CRMApp() {
  return (
    <BrowserRouter basename="/crm">
      <Refine
        dataProvider={supabaseDataProvider}
        authProvider={authProvider}
        liveProvider={supabaseLiveProvider}
        routerProvider={routerProvider}
        options={{
          liveMode: "auto",
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
        }}
        resources={[
          {
            name: "conversations",
            list: "/conversations",
            show: "/conversations/:id",
            meta: {
              label: "Leads & Messages",
              icon: "💬",
            },
          },
          {
            name: "bookings",
            list: "/bookings",
            create: "/bookings/create",
            edit: "/bookings/:id/edit",
            show: "/bookings/:id",
            meta: {
              label: "Bookings",
              icon: "📅",
            },
          },
          {
            name: "proposals",
            list: "/proposals",
            create: "/proposals/create",
            edit: "/proposals/:id/edit",
            meta: {
              label: "Proposals",
              icon: "📋",
            },
          },
          {
            name: "packages",
            list: "/packages",
            create: "/packages/create",
            edit: "/packages/:id/edit",
            meta: {
              label: "My Packages",
              icon: "🎒",
            },
          },
        ]}
      >
        <Routes>
          <Route
            element={
              <CRMLayout>
                <Outlet />
              </CRMLayout>
            }
          >
            <Route index element={<CRMDashboard />} />

            {/* Conversations/Leads */}
            <Route path="conversations">
              <Route index element={<ConversationList />} />
              <Route path=":id" element={<ConversationShow />} />
            </Route>

            {/* Bookings */}
            <Route path="bookings">
              <Route index element={<BookingList />} />
              <Route path="create" element={<BookingCreate />} />
              <Route path=":id" element={<BookingShow />} />
              <Route path=":id/edit" element={<BookingEdit />} />
            </Route>

            {/* Proposals */}
            <Route path="proposals">
              <Route index element={<ProposalList />} />
              <Route path="create" element={<ProposalCreate />} />
              <Route path=":id/edit" element={<ProposalEdit />} />
            </Route>

            {/* Packages */}
            <Route path="packages">
              <Route index element={<PackageList />} />
              <Route path="create" element={<PackageCreate />} />
              <Route path=":id/edit" element={<PackageEdit />} />
            </Route>
          </Route>
        </Routes>
      </Refine>
    </BrowserRouter>
  );
}
