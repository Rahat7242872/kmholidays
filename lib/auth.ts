import { timingSafeEqual } from 'crypto';
import { getServerSession, type AuthOptions } from 'next-auth';
import type { Provider } from 'next-auth/providers/index';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { createUser, findUserByEmail, getUserById } from '@/lib/data';
import { verifyPassword } from '@/lib/password';

export const authSecret = process.env.NEXTAUTH_SECRET || 'default-development-secret-change-in-env';

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

const isReal = (v?: string) => !!v && !v.startsWith('your-') && !v.startsWith('placeholder');

/** Social login is only offered when real OAuth keys are configured. */
export const oauthEnabled = {
  google: isReal(process.env.GOOGLE_CLIENT_ID) && isReal(process.env.GOOGLE_CLIENT_SECRET),
  github: isReal(process.env.GITHUB_CLIENT_ID) && isReal(process.env.GITHUB_CLIENT_SECRET),
};

type AppUser = { id: string; name: string; email: string; role: 'admin' | 'customer' };

const providers: Provider[] = [
  CredentialsProvider({
    id: 'admin',
    name: 'Admin',
    credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
    async authorize(credentials): Promise<AppUser | null> {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!credentials?.email || !credentials.password) return null;
      // 1) Owner account from .env (always admin).
      if (adminEmail && adminPassword) {
        const emailOk = safeEqual(credentials.email.trim().toLowerCase(), adminEmail.trim().toLowerCase());
        const passwordOk = safeEqual(credentials.password, adminPassword);
        if (emailOk && passwordOk) return { id: 'admin', name: 'Admin', email: adminEmail, role: 'admin' };
      }
      // 2) Website users that an admin promoted to "admin" (Admin → Customers).
      const user = await findUserByEmail(credentials.email);
      if (!user || user.role !== 'admin' || !(await verifyPassword(credentials.password, user.passwordHash))) return null;
      return { id: String(user.id), name: user.name, email: user.email, role: 'admin' };
    },
  }),
  CredentialsProvider({
    id: 'customer',
    name: 'Email',
    credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
    async authorize(credentials): Promise<AppUser | null> {
      if (!credentials?.email || !credentials.password) return null;
      const user = await findUserByEmail(credentials.email);
      if (!user || !(await verifyPassword(credentials.password, user.passwordHash))) return null;
      return { id: String(user.id), name: user.name, email: user.email, role: user.role };
    },
  }),
];
if (oauthEnabled.google) providers.push(GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }));
if (oauthEnabled.github) providers.push(GithubProvider({ clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! }));

async function linkOAuthUser(email: string, name?: string | null): Promise<{ id: number; role: 'admin' | 'customer' } | undefined> {
  const existing = await findUserByEmail(email);
  if (existing) return { id: existing.id, role: existing.role };
  try {
    const created = await createUser({ name: name || email.split('@')[0], email, phone: '', passwordHash: null });
    return { id: created.id, role: created.role };
  } catch {
    const again = await findUserByEmail(email); // created concurrently
    return again ? { id: again.id, role: again.role } : undefined;
  }
}

export const authOptions: AuthOptions = {
  providers,
  pages: { signIn: '/sign-in' },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, account }) {
      if (!user) return token;
      const u = user as Partial<AppUser>;
      if (account && account.provider !== 'admin' && account.provider !== 'customer') {
        // Google / GitHub: link to the site account with the same email, creating one if needed.
        const linked = user.email ? await linkOAuthUser(user.email, user.name) : undefined;
        token.role = linked?.role ?? 'customer';
        token.uid = linked?.id;
        return token;
      }
      token.role = u.role === 'admin' ? 'admin' : 'customer';
      // Website accounts have a numeric id (the .env owner account does not).
      token.uid = /^\d+$/.test(String(u.id)) ? Number(u.id) : undefined;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const su = session.user as { role?: string; id?: number };
        su.role = token.role as string | undefined;
        su.id = token.uid as number | undefined;
      }
      return session;
    },
  },
  secret: authSecret,
};

export type SessionUser = { name?: string | null; email?: string | null; image?: string | null; role?: string; id?: number };

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as SessionUser | undefined) ?? null;
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (user?.role !== 'admin') return null;
  // Promoted website users: re-check the database so removing admin access takes effect immediately.
  if (user.id) {
    const current = await getUserById(user.id);
    if (current?.role !== 'admin') return null;
  }
  return session;
}

/** Call at the top of every admin server action — actions are public endpoints. */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}
