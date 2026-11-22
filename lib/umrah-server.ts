import { getSetting, setSetting } from '@/lib/data';
import { normalizeUmrahConfig, type UmrahConfig } from '@/lib/umrah';

const KEY = 'umrah';

/** Live Umrah rates & packages (admin-edited, falling back to defaults). */
export async function getUmrahConfig(): Promise<UmrahConfig> {
  return normalizeUmrahConfig(await getSetting<Partial<UmrahConfig>>(KEY));
}

export async function saveUmrahConfig(config: UmrahConfig): Promise<void> {
  await setSetting(KEY, config);
}
