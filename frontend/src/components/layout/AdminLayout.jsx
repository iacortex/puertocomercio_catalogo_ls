import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <Topbar />

      <main className="pt-20 pl-64 p-6 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
