import { CheckCircle2, Database, HardDrive, Server, XCircle, Zap } from 'lucide-react';
import { PageHeader, Panel } from '@/components/admin/ui';
import { databaseStatus } from '@/lib/data';
import { cn } from '@/lib/utils';

export default async function DatabasePage() {
  const status = await databaseStatus();
  const isDb = status.backend === 'database';

  return (
    <>
      <PageHeader title="Database" text="Where your website data is stored and how much is in it." />

      <Panel className="overflow-hidden">
        <div className={cn('flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6', status.ok ? 'bg-emerald-50' : 'bg-red-50')}>
          <div className="flex items-center gap-4">
            <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl text-white', status.ok ? 'bg-emerald-600' : 'bg-red-600')}>
              {isDb ? <Database className="size-7" /> : <HardDrive className="size-7" />}
            </span>
            <div>
              <p className="flex items-center gap-1.5 text-lg font-extrabold text-ink">
                {status.ok ? <CheckCircle2 className="size-5 text-emerald-600" /> : <XCircle className="size-5 text-red-600" />}
                {isDb ? (status.ok ? 'Neon Postgres connected' : 'Database connection failed') : 'Local development file'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isDb ? <>Host: <code className="rounded bg-white px-1.5 py-0.5 text-xs">{status.host}</code></> : 'data/local-db.json — set DATABASE_URL to use Postgres.'}
              </p>
            </div>
          </div>
          {status.backend === 'database' && status.ok && (
            <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-white px-3 py-1.5 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200 sm:self-auto">
              <Zap className="size-4" /> {status.latencyMs} ms
            </span>
          )}
        </div>
        {status.backend === 'database' && !status.ok && <p className="px-6 py-4 font-mono text-xs break-all text-red-700">{status.error}</p>}
      </Panel>

      {'tables' in status && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {status.tables.map((t) => (
            <Panel key={t.name} className="p-5">
              <Server className="size-5 text-brand" />
              <p className="mt-3 text-3xl font-extrabold tabular-nums">{t.rows}</p>
              <p className="text-sm font-medium text-muted-foreground capitalize">{t.name}</p>
            </Panel>
          ))}
        </div>
      )}

      <Panel className="mt-6 p-5 text-sm text-muted-foreground sm:p-6">
        <p className="font-bold text-ink">Schema changes</p>
        <p className="mt-1">After changing <code className="rounded bg-muted px-1">db/schema.ts</code>, run <code className="rounded bg-muted px-1">npm run db:push</code> to update the tables. Your Neon dashboard has backups and a SQL editor for advanced work.</p>
      </Panel>
    </>
  );
}
