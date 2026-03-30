"use client";

import { useState } from "react";
import { ResourceCard, type Resource } from "@/components/ResourceCard";
import {
  CategoryFilter,
  type CategoryOption,
} from "@/components/CategoryFilter";

// ──────────────────────────────────────────────────────────────
// MOCK DATA — Replace with real API call to /api/resources?zip=
// when Lane C's API routes are ready.
// ──────────────────────────────────────────────────────────────
const MOCK_LOCATION = {
  city: "New York",
  state: "NY",
} as const;

const MOCK_CATEGORIES: CategoryOption[] = [
  { slug: "food", name: "Food" },
  { slug: "housing", name: "Housing" },
  { slug: "healthcare", name: "Healthcare" },
  { slug: "employment", name: "Employment" },
];

const MOCK_RESOURCES: Resource[] = [
  {
    id: "1",
    name: "SNAP (Food Stamps)",
    description:
      "Federal nutrition assistance program providing monthly benefits for purchasing food.",
    url: "https://www.fns.usda.gov/snap/supplemental-nutrition-assistance-program",
    scope: "National",
    eligibility_summary: "Income ≤ 130% FPL (gross)",
    phone: "1-800-221-5689",
    category: "food",
    verified_at: "2026-03-15",
  },
  {
    id: "2",
    name: "Feeding America — Food Bank Locator",
    description:
      "Find your nearest food bank in a network of 200+ food banks nationwide.",
    url: "https://www.feedingamerica.org/find-your-local-foodbank",
    scope: "National",
    eligibility_summary: "No income requirement",
    category: "food",
    verified_at: "2026-03-10",
  },
  {
    id: "3",
    name: "WIC",
    description:
      "Nutrition assistance for women, infants, and children under 5.",
    url: "https://www.fns.usda.gov/wic",
    scope: "National",
    eligibility_summary:
      "Pregnant/postpartum women, children under 5, income ≤ 185% FPL",
    phone: "1-800-522-5006",
    category: "food",
    verified_at: "2026-03-12",
  },
  {
    id: "4",
    name: "HUD Rental Assistance",
    description:
      "Section 8 housing vouchers and public housing programs for low-income families.",
    url: "https://www.hud.gov/topics/rental_assistance",
    scope: "National",
    eligibility_summary: "Income ≤ 50% AMI (typically)",
    phone: "1-800-955-2232",
    category: "housing",
    verified_at: "2026-03-14",
  },
  {
    id: "5",
    name: "NY Housing Authority (NYCHA)",
    description:
      "Public housing and Section 8 programs for New York City residents.",
    url: "https://www.nyc.gov/site/nycha/index.page",
    scope: "Local",
    eligibility_summary: "NYC residents, income limits vary by program",
    phone: "718-707-7771",
    address: "90 Church Street, New York, NY 10007",
    category: "housing",
    verified_at: "2026-03-08",
  },
  {
    id: "6",
    name: "Habitat for Humanity",
    description:
      "Affordable homeownership program through volunteer-built housing.",
    url: "https://www.habitat.org/housing-help",
    scope: "National",
    eligibility_summary: "Income 30-60% AMI, varies by affiliate",
    category: "housing",
    verified_at: "2026-03-11",
  },
  {
    id: "7",
    name: "Medicaid",
    description: "Free or low-cost health coverage for eligible individuals.",
    url: "https://www.medicaid.gov/",
    scope: "State",
    eligibility_summary: "Income-based, varies by state",
    category: "healthcare",
    verified_at: "2026-03-13",
  },
  {
    id: "8",
    name: "HRSA Health Centers",
    description:
      "Federally qualified health centers offering care on a sliding fee scale.",
    url: "https://findahealthcenter.hrsa.gov/",
    scope: "National",
    eligibility_summary: "Anyone — sliding fee scale based on income",
    category: "healthcare",
    verified_at: "2026-03-09",
  },
  {
    id: "9",
    name: "CareerOneStop",
    description:
      "DOL-sponsored job search, training, and career resources portal.",
    url: "https://www.careeronestop.org/",
    scope: "National",
    eligibility_summary: "Anyone",
    category: "employment",
    verified_at: "2026-03-14",
  },
  {
    id: "10",
    name: "NY Department of Labor",
    description:
      "Unemployment insurance, job training, and workforce services for New York residents.",
    url: "https://dol.ny.gov/",
    scope: "State",
    eligibility_summary: "NY residents, recently employed for UI benefits",
    phone: "1-888-469-7365",
    category: "employment",
    verified_at: "2026-03-07",
  },
];
// ──────────────────────────────────────────────────────────────

interface ResultsContentProps {
  zip: string;
}

export function ResultsContent({ zip }: ResultsContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // TODO: Replace with real API call — fetch(`/api/resources?zip=${zip}`)
  const location = MOCK_LOCATION;
  const resources = MOCK_RESOURCES;
  const categories = MOCK_CATEGORIES;

  const filtered =
    selectedCategory === "all"
      ? resources
      : resources.filter((r) => r.category === selectedCategory);

  return (
    <>
      {/* Location header */}
      <h1 className="text-xl sm:text-2xl font-bold text-foreground">
        Showing resources for {zip} — {location.city}, {location.state}
      </h1>

      {/* Category filter */}
      <div className="mt-4">
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Results count */}
      <p className="mt-4 text-sm text-muted">
        {filtered.length} {filtered.length === 1 ? "resource" : "resources"}
        {selectedCategory !== "all" ? ` in ${selectedCategory}` : ""}
      </p>

      {/* Resource list */}
      {filtered.length > 0 ? (
        <div className="mt-4 space-y-4">
          {filtered.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="mt-8 text-center py-12">
          <p className="text-lg text-muted">
            No resources found for this zip code.
          </p>
          <p className="mt-1 text-sm text-muted">
            Try selecting a different category or searching a nearby zip code.
          </p>
        </div>
      )}
    </>
  );
}
