import PolicySummary from "@/components/general/policy-summary";

export default function CompactPolicies() {
  return (
    <PolicySummary
      variant="footer"
      showStats={false}
      showContact={false}
      className="mt-8"
    />
  );
}
