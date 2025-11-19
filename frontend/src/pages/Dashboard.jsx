import AdminLayout from "../components/layout/AdminLayout";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Package, Tags, Users } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { title: "Productos", value: 120, icon: <Package /> },
    { title: "Categorías", value: 12, icon: <Tags /> },
    { title: "Usuarios", value: 5, icon: <Users /> },
  ];

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <Card key={s.title} className="shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {s.icon} {s.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
