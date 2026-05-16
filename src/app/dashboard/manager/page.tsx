import getCurrentUser from "../../actions/getCurrentUser";
import UserEmployees from "./components/UserEmployees";

export default async function ManagerDashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Welcome back, {user?.name || "Manager"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
          Monitor your team&apos;s performance and shift efficiency with real-time data.
        </p>
      </div>
      
      <UserEmployees />
    </div>
  );
}
