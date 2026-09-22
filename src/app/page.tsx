import { OverviewView } from "@/components/appliance/overview-view";
import { getCurrentUser } from "@/lib/security/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  // Pure PaaS Control Plane: check user session; if unauthenticated, redirect to /login
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <OverviewView />;
}
