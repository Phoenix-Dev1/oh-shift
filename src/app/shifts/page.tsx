// app/shifts/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ShiftBoard from "./components/ShiftBoard";

const ShiftsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="flex h-screen dark:bg-bg-800 mb-6 dark:text-text-primary">
      <div className="flex-1 p-6">
        <ShiftBoard />
      </div>
    </div>
  );
};

export default ShiftsPage;
