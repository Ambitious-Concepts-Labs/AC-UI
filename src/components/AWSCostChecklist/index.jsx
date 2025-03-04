"use client";
import dynamic from 'next/dynamic';

// Import the component with SSR disabled to avoid hydration errors
const AWSCostChecklistClient = dynamic(() => import('./Client'), {
  ssr: false,
});

// Simple wrapper component that exports the client-side-only component
export default function AWSCostChecklist() {
  return <AWSCostChecklistClient />;
}