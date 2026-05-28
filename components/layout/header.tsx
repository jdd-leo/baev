import Link from "next/link";
import { getCurrentUser } from "@/server/auth/session";
import { UserMenu } from "./user-menu";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 dark:border-white/15 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-14">
        <Link href="/" className="font-semibold tracking-tight">
          DEBATI
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/explore" className="hover:underline">
            Explorar
          </Link>
          <UserMenu user={user} />
        </nav>
      </div>
    </header>
  );
}
