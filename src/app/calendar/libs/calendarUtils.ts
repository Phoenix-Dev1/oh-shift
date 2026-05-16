import { 
  startOfWeek, 
  addDays, 
  startOfDay, 
  startOfMonth,
  addHours, 
  parseISO,
  max,
  min
} from "date-fns";

export interface GridCell {
  date: Date;
  hour: number;
  isoString: string;
}

export const generateWeekDays = (baseDate: Date = new Date()) => {
  const start = startOfWeek(baseDate, { weekStartsOn: 0 }); // Sunday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const generateMonthDays = (baseDate: Date = new Date()) => {
  const start = startOfWeek(startOfMonth(baseDate), { weekStartsOn: 0 });
  return Array.from({ length: 42 }, (_, i) => addDays(start, i)); // 6 weeks
};

/**
 * Standard 24-hour calendar grid (00:00 to 23:00)
 */
export const generateTimeSlots = () => {
  return Array.from({ length: 24 }, (_, i) => i);
};

export const getGridMatrix = (days: Date[], hours: number[]): GridCell[] => {
  const matrix: GridCell[] = [];
  days.forEach((day) => {
    hours.forEach((hour) => {
      const cellDate = addHours(startOfDay(day), hour);
      matrix.push({
        date: cellDate,
        hour,
        isoString: cellDate.toISOString(),
      });
    });
  });
  return matrix;
};

/**
 * Returns the logical row offset (0-23) based on a dynamic start hour.
 * Equivalent to CSS Grid indexing but adapted for our absolute positioning math.
 */
export const getGridRow = (date: Date, startHour: number) => {
  const hour = date.getHours();
  const minutes = date.getMinutes();
  // Offset by startHour to make it row 0
  const baseRow = ((hour - startHour + 24) % 24); 
  return baseRow + (minutes / 60);
};

/**
 * Calculates position for a Logical Business Day (startHour to startHour next day).
 */
export const calculateShiftPosition = (
  startTime: string, 
  endTime: string, 
  currentDay: Date,
  startHour: number
) => {
  const shiftStart = parseISO(startTime);
  const shiftEnd = parseISO(endTime);
  
  // Define the logical day bounds
  const opStart = addHours(startOfDay(currentDay), startHour);
  const opEnd = addHours(opStart, 24);

  // Get the segment of the shift that falls within this logical day
  const segmentStart = max([shiftStart, opStart]);
  const segmentEnd = min([shiftEnd, opEnd]);

  // If no overlap with this logical day, return null
  if (segmentStart >= segmentEnd) return null;

  const startRow = getGridRow(segmentStart, startHour);
  
  // If the segment ends exactly at opEnd (next day), it should span to row 24.
  const isEndNextLogicalDay = segmentEnd.getTime() === opEnd.getTime();
  let endRow = isEndNextLogicalDay ? 24 : getGridRow(segmentEnd, startHour);
  
  // Edge case safety for midnight crossing inside the logical day
  if (endRow < startRow && segmentEnd.getTime() > segmentStart.getTime()) {
    endRow += 24;
  }

  const durationRows = endRow - startRow;
  
  // Each hour is 64px
  const height = durationRows * 64;
  const top = startRow * 64;
  
  return {
    top,
    height,
    isClippedStart: shiftStart.getTime() < opStart.getTime(),
    isClippedEnd: shiftEnd.getTime() > opEnd.getTime(),
  };
};
