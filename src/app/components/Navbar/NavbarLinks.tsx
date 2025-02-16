// NavbarLinks.tsx
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const links = ["Calendar", "Dashboard"];

export default function NavbarLinks() {
  const { data: session } = useSession();

  return (
    <ul className="hidden gap-6 text-sm sm:flex">
      {links.map((label, index) => {
        const href = index === 0 ? "/" : `/${label.toLowerCase()}`;
        return (
          <li key={href} className="relative group">
            <Link
              href={href}
              className="relative text-[var(--text-primary)] font-medium transition-all duration-300 ease-in-out"
            >
              {label}
              <span className="absolute left-1/2 bottom-0 h-[1px] w-0 bg-gradient-to-r from-highlight to-indigo-400 transition-all duration-300 ease-in-out group-hover:w-full group-hover:left-0"></span>
            </Link>
          </li>
        );
      })}
      {session && (
        <li className="relative group">
          <button
            onClick={() => signOut()}
            className="relative text-[var(--text-primary)] font-medium transition-all duration-300 ease-in-out hover:text-red-500"
          >
            Logout
          </button>
        </li>
      )}
    </ul>
  );
}
