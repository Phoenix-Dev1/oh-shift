import getCurrentUser from "../../actions/getCurrentUser";
import SettingsContent from "./SettingsContent";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-in fade-in duration-700">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">System Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Manage your personal profile, regional preferences, and security.</p>
        </div>
        
        <SettingsContent user={user} />
      </div>
    </div>
  );
}
