// app/dashboard/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  // The "Bouncer" Logic
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Show a spinner while the context initializes
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">Loading secure data...</div>
      </div>
    );
  }

  // If we aren't loading and don't have a user, nothing will be rendered(useEffect will handle the redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Navbar / Header Area */}
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between rounded-lg bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">E-Goshwaara Dashboard</h1>
            <p className="text-sm text-gray-500">Managed via FastAPI & Next.js</p>
          </div>
          <button
            onClick={logout}
            className="rounded-md bg-red-50 text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* User Details Card */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-md border-t-4 border-indigo-500">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">Profile Information</h2>
            
            <div className="space-y-4">
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Email Address</span>
                <span className="font-medium text-gray-800">{user.email}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Account Status</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.is_active 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* API Status Card (Visualizing the Token) */}
          <div className="rounded-lg bg-white p-6 shadow-md border-t-4 border-emerald-500">
             <h2 className="mb-4 text-lg font-semibold text-gray-700">Security Context</h2>
             <p className="mb-4 text-sm text-gray-600">
                You are currently authenticated via <strong>LocalStorage</strong>. 
                Your session is being managed by a global context.
             </p>
             <div className="rounded bg-gray-50 p-4 text-xs text-gray-500">
                Token Status: <span className="text-green-600 font-bold">Valid</span><br/>
                Refresh Logic: <span className="text-blue-600 font-bold">Enabled</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}