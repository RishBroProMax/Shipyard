import { LandingView } from "@/components/public/landing-view";
import { OverviewView } from "@/components/appliance/overview-view";
import { getCurrentUser } from "@/lib/security/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  // If deployed on Vercel or explicitly configured as public showcase mode
  const isPublicMode =
    process.env.VERCEL === "1" ||
    process.env.SHIPYARD_MODE === "public" ||
    process.env.NEXT_PUBLIC_SHIPYARD_MODE === "public";

  if (isPublicMode) {
    return <LandingView />;
  }

  // In Appliance mode, verify session authentication before accessing control plane
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <OverviewView />;
}
