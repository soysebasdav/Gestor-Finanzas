import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, FileText, PlusCircle } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: "url('https://files.manuscdn.com/user_upload_by_module/session_file/310519663317952756/rYdZGAApxrvKIuMQ.png')",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="bg-white bg-opacity-95 rounded-lg shadow-2xl p-8 max-w-md text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Gestor de Ingresos y Finanzas</h1>
          <p className="text-gray-600 mb-6">Administra tus ingresos y egresos de manera eficiente</p>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold"
          >
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('https://files.manuscdn.com/user_upload_by_module/session_file/310519663317952756/rYdZGAApxrvKIuMQ.png')",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Gestor de Ingresos y Finanzas</h1>
            <p className="text-gray-600 mt-2">Bienvenido, {user?.name}</p>
          </div>
          <Button
            onClick={() => {
              setLocation("/dashboard");
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Ir al Dashboard
          </Button>
        </div>

        {/* Tarjetas de acceso rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/transactions")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-green-600" />
                Registrar Transacción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Agrega nuevos ingresos o egresos a tu registro</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/dashboard")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Visualiza tus datos financieros en tiempo real</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/reports")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Reportes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Genera informes y exporta datos a Excel</p>
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <div className="mt-12 bg-white bg-opacity-90 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Cómo usar el Gestor de Finanzas?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">1. Registra tus transacciones</h3>
              <p className="text-gray-600">Accede a la sección de transacciones para registrar nuevos ingresos o egresos con todos los detalles necesarios.</p>
            </div>
            <div>
              <h3 className="font-semibold text-green-600 mb-2">2. Visualiza tu información</h3>
              <p className="text-gray-600">Consulta el dashboard para ver gráficos, totales acumulados y un resumen de tus transacciones.</p>
            </div>
            <div>
              <h3 className="font-semibold text-green-600 mb-2">3. Genera reportes</h3>
              <p className="text-gray-600">Crea informes personalizados y descarga tus datos en formato Excel para análisis adicional.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
