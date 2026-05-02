import getCurrentUser from "../../actions/getCurrentUser";
import Sidebar from "../manager/components/Sidebar"; // Reusing manager sidebar for now, ideally would be role-agnostic
import SettingsContent from "./SettingsContent";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl animate-in fade-in duration-700">
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">System Settings</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Manage your personal profile, regional preferences, and security.</p>
            </div>
            
            <SettingsContent user={user} />
          </div>
        </div>
      </main>
    </div>
  );
}
