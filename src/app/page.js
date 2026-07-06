import HomePageClient from "./HomePageClient";
import { sb } from "../lib/db";
import { BRAND } from "../lib/brand";

async function getData() {
  // Her portal yalnızca kendi işletme tipindeki salonları listeler.
  // business_type kolonu view'da yoksa (migration çalıştırılmadıysa) filtresiz sorguya düşülür.
  let salonData = [];
  try {
    salonData = (await sb(`public_salons?select=*&business_type=eq.${BRAND.businessType}&limit=200`)) || [];
  } catch {
    try {
      salonData = (await sb("public_salons?select=*&limit=200")) || [];
    } catch {
      salonData = [];
    }
  }

  const [pricingRes, listingsRes] = await Promise.allSettled([
    sb("pricing_plans?select=*&is_active=eq.true&order=price.asc"),
    sb("listings?select=*&is_active=eq.true&order=created_at.desc&limit=6"),
  ]);

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
