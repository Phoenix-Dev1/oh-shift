// app/shifts/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import ShiftBoard from "./components/ShiftBoard";
import Button from "../components/Button";

interface ShiftBoardProps {
  week: number;
  days: Date[];
}

const getWeekDates = (
  weekOffset: number
): { weekDates: Date[]; weekNumber: number } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const currentYearStart = new Date(startOfWeek.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((startOfWeek.getTime() - currentYearStart.getTime()) / 86400000 +
      currentYearStart.getDay() +
      1) /
      7
  );

  return { weekDates, weekNumber };
};

const ShiftsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [week, setWeek] = useState<number>(0);
  const { weekDates, weekNumber } = useMemo(() => getWeekDates(week), [week]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="flex h-screen dark:bg-bg-800 mb-6 dark:text-text-primary">
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => setWeek((prev) => prev - 1)}>
            Previous Week
          </Button>
          <h2 className="text-xl font-bold">Week {weekNumber}</h2>
          <Button onClick={() => setWeek((prev) => prev + 1)}>Next Week</Button>
        </div>
        <ShiftBoard week={weekNumber} days={weekDates} />
      </div>
    </div>
  );
};

export default ShiftsPage;
