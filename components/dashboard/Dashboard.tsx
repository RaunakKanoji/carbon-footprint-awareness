export default function Dashboard() {
  const monthlyBudgetKg = 500;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Welcome back! Here is your carbon footprint summary.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Monthly Budget</h3>
            <p className="text-3xl font-bold mt-2">
              {monthlyBudgetKg} <span className="text-base font-normal text-zinc-500">kg CO2e</span>
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Current Footprint
            </h3>
            <p className="text-3xl font-bold mt-2">
              -- <span className="text-base font-normal text-zinc-500">kg CO2e</span>
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Remaining</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">
              -- <span className="text-base font-normal text-green-600/80">kg CO2e</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
