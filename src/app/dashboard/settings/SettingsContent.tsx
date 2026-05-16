"use client";

import { useState } from "react";
import { User, Shield, Bell, Globe, Camera, Save, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { User as UserType } from "@/src/app/types";

interface SettingsContentProps {
  user: UserType;
}

export default function SettingsContent({ user }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState("profile");

  const bentoCardStyle = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8";
  const labelStyle = "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 mb-2 block";
  const inputStyle = "w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Navigation Sidebar (Inside Content) */}
      <div className="md:col-span-1 space-y-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === "profile" 
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800" 
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <User className="w-4 h-4" /> Profile Information
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === "security" 
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800" 
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Shield className="w-4 h-4" /> Security & Privacy
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === "notifications" 
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800" 
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Bell className="w-4 h-4" /> Notification Preferences
        </button>
        
        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> Terminate Session
          </button>
        </div>
      </div>

      {/* Main Settings Area */}
      <div className="md:col-span-2 space-y-8">
        {activeTab === "profile" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={bentoCardStyle}
          >
            <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700">
                  {user?.image ? (
                    <Image src={user.image} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8" />
                  )}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Public Profile</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">This information will be visible to your teammates.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className={labelStyle}>Full Display Name</span>
                  <input type="text" defaultValue={user?.name || ""} className={inputStyle} />
                </div>
                <div className="space-y-2">
                  <span className={labelStyle}>Professional Title</span>
                  <input type="text" placeholder="e.g. Regional Manager" className={inputStyle} />
                </div>
              </div>

              <div className="space-y-2">
                <span className={labelStyle}>Email Address</span>
                <input type="email" defaultValue={user?.email || ""} className={inputStyle} disabled />
                <p className="text-[10px] text-slate-400 font-medium">Primary contact email cannot be changed.</p>
              </div>

              <div className="pt-6 flex justify-end">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-indigo-500/20 active:scale-95">
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "security" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={bentoCardStyle}
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8">Security & Access</h3>
            
            <div className="space-y-8">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Add an extra layer of security to your account.</p>
                </div>
                <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>

              <div className="space-y-4">
                <span className={labelStyle}>Reset Password</span>
                <input type="password" placeholder="Current password" className={inputStyle} />
                <input type="password" placeholder="New secure password" className={inputStyle} />
                <div className="flex justify-end pt-2">
                  <button className="px-6 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Localization Preferences */}
        <div className={bentoCardStyle}>
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Regional Preferences</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className={labelStyle}>Primary Language</span>
              <select className={inputStyle}>
                <option>English (US)</option>
                <option>Hebrew</option>
                <option>Spanish</option>
              </select>
            </div>
            <div className="space-y-2">
              <span className={labelStyle}>Time Zone</span>
              <select className={inputStyle}>
                <option>(GMT+02:00) Jerusalem</option>
                <option>(GMT-05:00) Eastern Time</option>
              </select>
            </div>
            <div className="space-y-2">
              <span className={labelStyle}>Business Day Start Time</span>
              <select 
                className={inputStyle}
                defaultValue={user?.businessDayStartHour ?? 7}
                onChange={async (e) => {
                  try {
                    const { updateBusinessDayStartHour } = await import("../../actions/userSettingsActions");
                    const { toast } = await import("sonner");
                    await updateBusinessDayStartHour(parseInt(e.target.value, 10));
                    toast.success("Business day start time updated!");
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
