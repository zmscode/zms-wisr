import { useState, useEffect } from "react";
import { Sidebar, SidebarProvider } from "./components/ui/sidebar";
import { Button } from "./components/ui/button";
import { Sun, Moon, Search, Menu } from "lucide-react";
import clsx from "clsx";
import CommandPalette from "./components/CommandPalette";
import ABNLookupDialog from "./components/ABNLookupDialog";

function App() {
  const [abnLookupOpen, setAbnLookupOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? storedTheme === "dark" : true;
  });
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const sidebarClasses = clsx(
    darkMode ? "bg-zinc-900" : "bg-zinc-200",
    "flex-shrink-0 w-64 p-4 border-r border-gray-300 dark:border-gray-700",
    darkMode ? "text-white" : "text-black"
  );

  // Shared sidebar content for both desktop and mobile.
  const SidebarContent = ({ onClose }) => (
    <>
      <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
        Dashboard
      </h2>
      <Button
        className="w-full flex items-center gap-2 text-black dark:text-black"
        onClick={() => {
          setAbnLookupOpen(true);
          if (onClose) onClose();
        }}
      >
        <Search size={20} /> ABN Lookup
      </Button>
      <div className="mt-auto">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 border-gray-400 dark:border-gray-600 text-black dark:text-white"
          onClick={() => {
            setDarkMode(!darkMode);
            if (onClose) onClose();
          }}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />} Toggle Theme
        </Button>
      </div>
    </>
  );

  return (
    <>
      <CommandPalette setAbnLookupOpen={setAbnLookupOpen} />
      <ABNLookupDialog
        abnLookupOpen={abnLookupOpen}
        setAbnLookupOpen={setAbnLookupOpen}
      />
      <SidebarProvider>
        {/* Desktop Sidebar – visible on medium screens and up */}
        <div className="hidden md:block">
          <Sidebar className={sidebarClasses}>
            <SidebarContent />
          </Sidebar>
        </div>

        {/* Main Content */}
        <div
          className={clsx(
            darkMode ? "bg-zinc-800" : "bg-zinc-100",
            "flex-1 flex flex-col items-center justify-center p-6",
            "ml-0 md:ml-64",
            darkMode ? "text-white" : "text-black",
            "relative"
          )}
        >
          {/* Mobile Header with Hamburger – visible on small screens */}
          <div className="md:hidden absolute top-4 left-4 z-50">
            <Button onClick={() => setMobileSidebarOpen(true)}>
              <Menu size={24} />
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-4">ZMS-WISR</h1>
          <p className="text-lg">CMD+K or open the sidebar.</p>
        </div>

        {/* Mobile Sidebar Overlay – appears on mobile when toggled */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className={sidebarClasses}
              style={{
                justifyContent: "space-between",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <SidebarContent onClose={() => setMobileSidebarOpen(false)} />
            </div>
            {/* Clicking on the backdrop closes the mobile sidebar */}
            <div
              className="flex-1"
              onClick={() => setMobileSidebarOpen(false)}
            />
          </div>
        )}
      </SidebarProvider>
    </>
  );
}

export default App;
