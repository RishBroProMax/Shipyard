import { LandingView } from "@/components/public/landing-view";
import { OverviewView } from "@/components/appliance/overview-view";

export const dynamic = "force-dynamic";

export default function RootPage() {
  // If deployed on Vercel or explicitly configured as public showcase mode
  const isPublicMode =
    process.env.VERCEL === "1" ||
    process.env.SHIPYARD_MODE === "public" ||
    process.env.NEXT_PUBLIC_SHIPYARD_MODE === "public";

  if (isPublicMode) {
    return <LandingView />;
  }

  return <OverviewView />;
}
