import ShiftBoardManager from "./components/ShiftBoardManager/ShiftBoardManager";
import EmployeeBoardManager from "./components/EmployeeBoardManager/EmployeeBoardManager";
import getCurrentUser from "../actions/getCurrentUser";

export default async function ShiftsPage() {
  const user = await getCurrentUser();
  const role = user?.role;

  if (user?.role !== "MANAGER" && user?.employeeManagerId === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-900 dark:bg-bg-800 text-text-primary p-6">
        <div className="max-w-3xl text-center bg-white dark:bg-bg-700 p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl sm:text-4xl font-bold text-highlight">
            Welcome to Oh-Shift!
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            You’re all set! However, before you can start using the platform,
            your **manager** needs to add you to their scheduling system.
          </p>
          <p className="mt-2 text-text-secondary">
            Oh-Shift helps streamline scheduling, allowing managers to create
            and assign shifts efficiently. Once added, you will be able to view
            your upcoming shifts, check your work schedule, and stay up-to-date!
          </p>
          <div className="mt-6">
            <span className="block text-lg font-semibold text-text-primary">
              What to do next?
            </span>
            <ul className="mt-3 space-y-2 text-text-secondary text-sm sm:text-base">
              <li>✅ Contact your manager to get assigned.</li>
              <li>✅ Once assigned, your weekly schedule will appear here.</li>
              <li>
                ✅ Enjoy a **better, faster, and smarter scheduling
                experience**.
              </li>
            </ul>
          </div>
          <div className="mt-6">
            <p className="text-text-secondary">
              Need help? Visit our{" "}
              <a
                href="https://barkaziro.co.il/"
                className="text-highlight font-semibold"
              >
                Help Center
              </a>{" "}
              or talk to your manager.
            </p>
          </div>
        </div>
      </div>
    );
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
