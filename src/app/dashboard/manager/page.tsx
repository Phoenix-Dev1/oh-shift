import UserEmployees from "./components/UserEmployees";
import Sidebar from "./components/Sidebar";
import getCurrentUser from "../../actions/getCurrentUser";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen bg-bg-full">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-bg-900 text-text-primary">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {user?.name} Employees
        </h1>
        <UserEmployees />
      </main>
    </div>
  );
}
