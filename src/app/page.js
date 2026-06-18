import HomePageClient from "./HomePageClient";
import { sb } from "../lib/db";

async function getData() {
  const [salonsRes, pricingRes, listingsRes] = await Promise.allSettled([
    sb("public_salons?select=*&limit=200"),
    sb("pricing_plans?select=*&is_active=eq.true&order=price.asc"),
    sb("listings?select=*&is_active=eq.true&order=created_at.desc&limit=6"),
  ]);

  const salonData = salonsRes.status === "fulfilled" ? (salonsRes.value || []) : [];
  const allCities = [...new Set(salonData.map(s => s.city).filter(Boolean))].sort();

  return {
    initialSalons: salonData,
    allCities,
    pricingPlans: pricingRes.status === "fulfilled" ? (pricingRes.value || []) : [],
    listings: listingsRes.status === "fulfilled" ? (listingsRes.value || []) : [],
  };
}

export const revalidate = 300;

export default async function Home() {
  const data = await getData();
  return <HomePageClient {...data} />;
}
