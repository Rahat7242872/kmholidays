'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/site';
import { SERVICE_KEYS, TIERS, normalizeUmrahConfig, type ServiceKey, type Tier, type UmrahConfig, type UmrahPackage } from '@/lib/umrah';
import { saveUmrahConfig } from '@/lib/umrah-server';

const num = (v: unknown, fallback = 0) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};
const str = (v: unknown, max = 160) => String(v ?? '').trim().slice(0, max);

/** Validates and saves the Umrah rates & packages edited in /admin/umrah. */
export async function saveUmrahSettings(raw: UmrahConfig): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const base = normalizeUmrahConfig(raw);
  const r = base.rates;
  const n2 = <T extends Record<string, number>>(o: T): T => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, num(v)])) as T;

  const usedIds = new Set<string>();
  const packages: UmrahPackage[] = (raw.packages ?? []).slice(0, 30).map((p, i) => {
    let id = slugify(str(p.id) || str(p.name) || `package-${i + 1}`) || `package-${i + 1}`;
    while (usedIds.has(id)) id = `${id}-${i + 1}`;
    usedIds.add(id);
    return {
      id,
      name: str(p.name) || `Package ${i + 1}`,
      nameBn: str(p.nameBn),
      tier: (TIERS as readonly string[]).includes(p.tier) ? (p.tier as Tier) : 'standard',
      makkahNights: Math.min(60, num(p.makkahNights, 7)),
      madinahNights: Math.min(60, num(p.madinahNights, 4)),
      makkahHotel: str(p.makkahHotel),
      madinahHotel: str(p.madinahHotel),
      makkahDistance: str(p.makkahDistance, 40),
      madinahDistance: str(p.madinahDistance, 40),
      muallim: str(p.muallim, 80),
      muallimNote: str(p.muallimNote, 120),
      departure: str(p.departure, 60),
      seats: p.seats === null || p.seats === undefined || String(p.seats) === '' ? null : num(p.seats),
      price: num(p.price),
      includes: (Array.isArray(p.includes) ? p.includes : []).filter((k): k is ServiceKey => (SERVICE_KEYS as readonly string[]).includes(k)),
      featured: !!p.featured,
    };
  });

  const config: UmrahConfig = {
    rates: {
      visa: num(r.visa),
      flight: n2(r.flight),
      makkahRoom: n2(r.makkahRoom),
      madinahRoom: n2(r.madinahRoom),
      transport: n2(r.transport),
      ziyarat: n2(r.ziyarat),
      food: n2(r.food),
      muallim: n2(r.muallim),
    },
    packages,
  };

  try {
    await saveUmrahConfig(config);
  } catch (error) {
    console.error('Failed to save Umrah settings', error);
    return { ok: false, message: 'Could not save. Please try again.' };
  }
  revalidatePath('/umrah');
  revalidatePath('/admin/umrah');
  return { ok: true, message: 'Saved — the Umrah page is updated.' };
}
