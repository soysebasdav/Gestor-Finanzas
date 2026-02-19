import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Download, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function Reports() {
  const { user, loading: authLoading } = useAuth();
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const { data: categories } = trpc.categories.list.useQuery({});

  const { data: transactions } = trpc.transactions.list.useQuery({
    filters: {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  // Calcular totales por categoría
  const totalsByCategory = transactions?.reduce((acc: any, t) => {
    const categoryId = t.categoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = { ingreso: 0, egreso: 0 };
    }
    acc[categoryId][t.type] += t.amount;
    return acc;
  }, {});

  // Calcular totales por concepto
  const totalsByConcept = transactions?.reduce((acc: any, t) => {
    const conceptId = t.conceptId;
    if (!acc[conceptId]) {
      acc[conceptId] = { ingreso: 0, egreso: 0 };
    }
    acc[conceptId][t.type] += t.amount;
    return acc;
  }, {});

  const ingresos = transactions?.filter((t) => t.type === "ingreso").reduce((sum, t) => sum + t.amount, 0) || 0;
  const egresos = transactions?.filter((t) => t.type === "egreso").reduce((sum, t) => sum + t.amount, 0) || 0;

  const exportToExcel = () => {
    if (!transactions || transactions.length === 0) {
      toast.error("No hay transacciones para exportar");
      return;
    }

    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Hoja 1: Transacciones detalladas
    const transactionsData = transactions.map((t) => ({
      Fecha: new Date(t.date).toLocaleDateString("es-CO"),
      Tipo: t.type,
      Categoría: t.categoryId,
      Concepto: t.conceptId,
      Contenido: t.content,
      Monto: t.amount / 100,
      Comentario: t.comment || "",
    }));

    const ws1 = XLSX.utils.json_to_sheet(transactionsData);
    XLSX.utils.book_append_sheet(wb, ws1, "Transacciones");

    // Hoja 2: Resumen por categoría
    const categorySummary = Object.entries(totalsByCategory || {}).map(([catId, totals]: any) => {
      const cat = categories?.find((c) => c.id === Number(catId));
      return {
        Categoría: cat?.name || catId,
        Ingresos: totals.ingreso / 100,
        Egresos: totals.egreso / 100,
        Neto: (totals.ingreso - totals.egreso) / 100,
      };
    });

    const ws2 = XLSX.utils.json_to_sheet(categorySummary);
    XLSX.utils.book_append_sheet(wb, ws2, "Resumen Categorías");

    // Hoja 3: Resumen general
    const generalSummary = [
      { Concepto: "Total Ingresos", Monto: ingresos / 100 },
      { Concepto: "Total Egresos", Monto: egresos / 100 },
      { Concepto: "Neto", Monto: (ingresos - egresos) / 100 },
    ];

    const ws3 = XLSX.utils.json_to_sheet(generalSummary);
    XLSX.utils.book_append_sheet(wb, ws3, "Resumen General");

    // Descargar
    const fileName = `Reporte_Finanzas_${startDate}_a_${endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success("Reporte exportado exitosamente");
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Reportes e Informes</h1>
          <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
            <Download className="mr-2 w-4 h-4" />
            Descargar Excel
          </Button>
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

        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${(ingresos / 100).toLocaleString("es-CO")}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Egresos</CardTitle>
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
              <div className={`text-2xl font-bold ${ingresos - egresos >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${((ingresos - egresos) / 100).toLocaleString("es-CO")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {!totalsByCategory || Object.keys(totalsByCategory).length === 0 ? (
              <p className="text-center py-8 text-gray-500">No hay datos para mostrar</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-2">Categoría</th>
                      <th className="text-right py-3 px-2">Ingresos</th>
                      <th className="text-right py-3 px-2">Egresos</th>
                      <th className="text-right py-3 px-2">Neto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(totalsByCategory).map(([catId, totals]: any) => {
                      const cat = categories?.find((c) => c.id === Number(catId));
                      return (
                        <tr key={catId} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">{cat?.name || catId}</td>
                          <td className="text-right py-3 px-2 text-green-600">${(totals.ingreso / 100).toLocaleString("es-CO")}</td>
                          <td className="text-right py-3 px-2 text-red-600">${(totals.egreso / 100).toLocaleString("es-CO")}</td>
                          <td className="text-right py-3 px-2 font-semibold">
                            ${((totals.ingreso - totals.egreso) / 100).toLocaleString("es-CO")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen por Concepto */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Concepto</CardTitle>
          </CardHeader>
          <CardContent>
            {!totalsByConcept || Object.keys(totalsByConcept).length === 0 ? (
              <p className="text-center py-8 text-gray-500">No hay datos para mostrar</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-2">Concepto</th>
                      <th className="text-right py-3 px-2">Ingresos</th>
                      <th className="text-right py-3 px-2">Egresos</th>
                      <th className="text-right py-3 px-2">Neto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(totalsByConcept).map(([conceptId, totals]: any) => (
                      <tr key={conceptId} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">{conceptId}</td>
                        <td className="text-right py-3 px-2 text-green-600">${(totals.ingreso / 100).toLocaleString("es-CO")}</td>
                        <td className="text-right py-3 px-2 text-red-600">${(totals.egreso / 100).toLocaleString("es-CO")}</td>
                        <td className="text-right py-3 px-2 font-semibold">
                          ${((totals.ingreso - totals.egreso) / 100).toLocaleString("es-CO")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
