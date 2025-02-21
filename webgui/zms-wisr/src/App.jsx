import { useState, useEffect } from "react";
import { Sidebar, SidebarProvider } from "./components/ui/sidebar";
import { Button } from "./components/ui/button";
import { Sun, Moon, Home, Settings, FileText } from "lucide-react";
import clsx from "clsx";
import CommandPalette from "./components/CommandPalette";

function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <>
      <CommandPalette />

      <SidebarProvider>
        <div
          className={clsx(
            "flex h-screen",
            darkMode ? "text-white" : "text-black"
          )}
        >
          <Sidebar
            className={`${
              darkMode ? "bg-zinc-900" : "bg-zinc-200"
            } flex-shrink-0 w-64 p-4 border-r border-gray-300 dark:border-gray-700`}
          >
            <h2 className="text-xl font-bold mb-4">Dashboard</h2>
            <Button variant="ghost" className="w-full flex items-center gap-2">
              <Home size={20} /> Home
            </Button>
            <Button variant="ghost" className="w-full flex items-center gap-2">
              <FileText size={20} /> Reports
            </Button>
            <Button variant="ghost" className="w-full flex items-center gap-2">
              <Settings size={20} /> Settings
            </Button>
            <div className="mt-auto">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 border-gray-400 dark:border-gray-600 text-black dark:text-white"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />} Toggle Theme
              </Button>
            </div>
          </Sidebar>
        </div>
        <div
          className={`${
            darkMode ? "bg-zinc-800" : "bg-zinc-100"
          } flex-1 flex flex-col items-center justify-center p-6`}
          style={{ marginLeft: 256 }}
        >
          <h1
            className={`${
              darkMode ? "text-white" : "text-black"
            } text-3xl font-bold mb-4`}
          >
            Welcome to the Dashboard
          </h1>
          <p className={`${darkMode ? "text-white" : "text-black"} text-lg`}>
            This is a basic ShadCN dashboard with a sidebar and theme toggle.
          </p>
        </div>
      </SidebarProvider>
    </>
  );
}

export default App;
