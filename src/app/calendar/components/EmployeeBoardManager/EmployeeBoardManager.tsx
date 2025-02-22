"use client";

import { useState, useEffect } from "react";
import HoverModal from "../ShiftBoardManager/HoverModal";
import CustomFullCalendar from "./CustomFullCalendar";
import MobileFullCalendar from "./MobileFullCalendar";
import useIsMobile from "../../../hooks/useIsMobile";
import { Shift } from "../../../types/index";
import { fetchEmployeeShifts } from "../../handlers/useEmployeeShiftHandlers";

const EmployeeBoardManager: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoverModalData, setHoverModalData] = useState<{
    x: number;
    y: number;
    shift: Shift;
  } | null>(null);

  const isMobile = useIsMobile();

  useEffect(() => {
    fetchEmployeeShifts(setShifts).finally(() => setLoading(false));
  }, []);

  const mapShiftsToEvents = (shifts: Shift[]) => {
    return shifts.map((shift) => ({
      id: shift.id,
      title:
        shift.allDay || !shift.employees?.length
          ? shift.title || "All Day Shift"
          : (shift.employees || []).map((e) => e.name).join(", ") ||
            "No Employees",
      start: shift.startTime,
      end: shift.endTime,
      allDay: shift.allDay,
    }));
  };

  return (
    <div className="p-4">
      {/* Hover Modal */}
      {!isMobile && (
        <HoverModal
          x={hoverModalData?.x ?? 0}
          y={hoverModalData?.y ?? 0}
          startTime={
            hoverModalData?.shift?.startTime
              ? new Date(hoverModalData.shift.startTime).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              : ""
          }
          endTime={
            hoverModalData?.shift?.endTime
              ? new Date(hoverModalData.shift.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""
          }
          employees={
            hoverModalData && !hoverModalData.shift.allDay
              ? hoverModalData.shift.employees.map((emp) => ({
                  name: emp.name,
                  position: emp.position ?? "N/A",
                }))
              : []
          }
          isVisible={!!hoverModalData}
        />
      )}

      {isMobile ? (
        <MobileFullCalendar
          shifts={shifts}
          mapShiftsToEvents={mapShiftsToEvents}
          setHoverModalData={setHoverModalData}
        />
      ) : (
        <CustomFullCalendar
          shifts={shifts}
          mapShiftsToEvents={mapShiftsToEvents}
          setHoverModalData={setHoverModalData}
        />
      )}

      {loading && <p className="text-center mt-4">Loading shifts...</p>}
    </div>
  );
};

export default EmployeeBoardManager;
