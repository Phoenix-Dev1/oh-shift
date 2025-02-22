import ShiftBoardManager from "./components/ShiftBoardManager/ShiftBoardManager";
import EmployeeBoardManager from "./components/EmployeeBoardManager/EmployeeBoardManager";
import getCurrentUser from "../actions/getCurrentUser";

export default async function ShiftsPage() {
  const user = await getCurrentUser();
  const role = user?.role;

  if (user?.role !== "MANAGER" && user?.employeeManagerId === null) {
    return <div className="text-text-primary">Talk to your manager bro</div>;
  }

  return (
    <div className="flex h-screen dark:bg-bg-800 mb-6 dark:text-text-primary">
      <div className="flex-1 p-2">
        {role === "MANAGER" ? (
          <ShiftBoardManager />
        ) : role === "EMPLOYEE" ? (
          <EmployeeBoardManager />
        ) : (
          <div className="text-center text-red-500">
            Unauthorized: Role not recognized
          </div>
        )}
      </div>
    </div>
  );
}
