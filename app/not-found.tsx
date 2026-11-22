import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-brand text-white"><Compass className="size-8" /></span>
      <h1 className="mt-6 text-5xl font-medium text-ink">Lost the trail?</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">This page doesn’t exist — but plenty of good places do.</p>
      <Link href="/" className="mt-8 rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-700">Back to home</Link>
    </div>
  );
}
