import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Calendar } from "lucide-react";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const { data: transactions, isLoading: transLoading } = trpc.transactions.list.useQuery({
    filters: {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // Calcular totales
  const ingresos = transactions?.filter((t) => t.type === "ingreso").reduce((sum, t) => sum + t.amount, 0) || 0;
  const egresos = transactions?.filter((t) => t.type === "egreso").reduce((sum, t) => sum + t.amount, 0) || 0;
  const neto = ingresos - egresos;

  // Datos para gráficos
  const chartData = [
    { name: "Ingresos", value: ingresos / 100 },
    { name: "Egresos", value: egresos / 100 },
  ];

  const COLORS = ["#10b981", "#ef4444"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Financiero</h1>
        </div>

        {/* Filtros de Fecha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Filtro de Fechas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Mostrando transacciones desde <strong>{new Date(startDate).toLocaleDateString("es-CO")}</strong> hasta{" "}
              <strong>{new Date(endDate).toLocaleDateString("es-CO")}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${(ingresos / 100).toLocaleString("es-CO")}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Egresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${(egresos / 100).toLocaleString("es-CO")}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Neto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${neto >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${(neto / 100).toLocaleString("es-CO")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparativa Ingresos vs Egresos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value.toLocaleString("es-CO")}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Transacciones recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Transacciones en el Período</CardTitle>
          </CardHeader>
          <CardContent>
            {transLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin" />
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Fecha</th>
                      <th className="text-left py-2 px-2">Concepto</th>
                      <th className="text-left py-2 px-2">Contenido</th>
                      <th className="text-left py-2 px-2">Tipo</th>
                      <th className="text-right py-2 px-2">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((t) => (
                      <tr key={t.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{new Date(t.date).toLocaleDateString("es-CO")}</td>
                        <td className="py-2 px-2">{t.conceptId}</td>
                        <td className="py-2 px-2">{t.content}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${t.type === "ingreso" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="text-right py-2 px-2 font-semibold">${(t.amount / 100).toLocaleString("es-CO")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No hay transacciones en este período</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
