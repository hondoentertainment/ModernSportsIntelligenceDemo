import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import TierGate, { SubscriptionTier } from "./TierGate";
import { getRouteTier } from "../lib/routeTierConfig";

interface TieredRouteProps {
  children: ReactNode;
  requiredTier: SubscriptionTier;
  featureName?: string;
}

/**
 * Wraps a route element with explicit tier requirement.
 */
export function TieredRoute({ children, requiredTier, featureName }: TieredRouteProps) {
  return (
    <TierGate requiredTier={requiredTier} featureName={featureName}>
      {children}
    </TierGate>
  );
}

/**
 * AutoTierGate — Wraps all child routes and automatically enforces
 * tier requirements based on the ROUTE_TIER_MAP config.
 *
 * Place this inside the layout, around the <Routes> block.
 * Routes not in the map are treated as free-tier (no gate).
 */
export function AutoTierGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  // Strip trailing slash for consistent matching
  const path = location.pathname.replace(/\/$/, "") || "/";
  const tierEntry = getRouteTier(path);

  if (!tierEntry) {
    // Free tier or unmapped route — no gate
    return <>{children}</>;
  }

  return (
    <TierGate requiredTier={tierEntry.tier} featureName={tierEntry.featureName}>
      {children}
    </TierGate>
  );
}

export default TieredRoute;
