import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Transactions() {
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "egreso" as "ingreso" | "egreso",
    categoryId: "",
    conceptId: "",
    amount: "",
    content: "",
    comment: "",
  });

  const { data: categories } = trpc.categories.list.useQuery({
    type: formData.type,
  });

  const { data: concepts } = trpc.concepts.list.useQuery({
    categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
  });

  const { data: transactions, refetch: refetchTransactions } = trpc.transactions.list.useQuery({
    filters: {},
  });

  const createMutation = trpc.transactions.create.useMutation({
    onSuccess: () => {
      toast.success("Transacción creada exitosamente");
      setFormData({
        date: new Date().toISOString().split("T")[0],
        type: "egreso",
        categoryId: "",
        conceptId: "",
        amount: "",
        content: "",
        comment: "",
      });
      refetchTransactions();
    },
    onError: (error) => {
      toast.error("Error al crear la transacción");
    },
  });

  const deleteMutation = trpc.transactions.delete.useMutation({
    onSuccess: () => {
      toast.success("Transacción eliminada");
      refetchTransactions();
    },
    onError: () => {
      toast.error("Error al eliminar la transacción");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.conceptId || !formData.amount || !formData.content) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    const date = new Date(formData.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    createMutation.mutate({
      date: date,
      month,
      year,
      type: formData.type,
      categoryId: Number(formData.categoryId),
      conceptId: Number(formData.conceptId),
      amount: Math.round(Number(formData.amount) * 100),
      content: formData.content,
      comment: formData.comment || null,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta transacción?")) {
      deleteMutation.mutate({ id });
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Registro de Transacciones</h1>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>Nueva Transacción</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value, categoryId: "", conceptId: "" })}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ingreso">Ingreso</SelectItem>
                      <SelectItem value="egreso">Egreso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value, conceptId: "" })}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="concept">Concepto</Label>
                  <Select value={formData.conceptId} onValueChange={(value) => setFormData({ ...formData, conceptId: value })}>
                    <SelectTrigger id="concept">
                      <SelectValue placeholder="Selecciona un concepto" />
                    </SelectTrigger>
                    <SelectContent>
                      {concepts?.map((concept) => (
                        <SelectItem key={concept.id} value={String(concept.id)}>
                          {concept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Contenido</Label>
                  <Input
                    id="content"
                    type="text"
                    placeholder="Descripción breve"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="comment">Comentario</Label>
                <Textarea
                  id="comment"
                  placeholder="Notas adicionales (opcional)"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={createMutation.isPending} className="w-full bg-green-600 hover:bg-green-700">
                {createMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                Registrar Transacción
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de transacciones */}
        <Card>
          <CardHeader>
            <CardTitle>Transacciones Registradas</CardTitle>
          </CardHeader>
          <CardContent>
            {!transactions || transactions.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No hay transacciones registradas</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-2">Fecha</th>
                      <th className="text-left py-3 px-2">Tipo</th>
                      <th className="text-left py-3 px-2">Categoría</th>
                      <th className="text-left py-3 px-2">Concepto</th>
                      <th className="text-left py-3 px-2">Contenido</th>
                      <th className="text-right py-3 px-2">Monto</th>
                      <th className="text-center py-3 px-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">{new Date(t.date).toLocaleDateString("es-CO")}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${t.type === "ingreso" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="py-3 px-2">{t.categoryId}</td>
                        <td className="py-3 px-2">{t.conceptId}</td>
                        <td className="py-3 px-2">{t.content}</td>
                        <td className="text-right py-3 px-2 font-semibold">${(t.amount / 100).toLocaleString("es-CO")}</td>
                        <td className="text-center py-3 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(t.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
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
