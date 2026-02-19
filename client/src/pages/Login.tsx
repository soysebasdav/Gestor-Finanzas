import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.demoLogin.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Sesión iniciada");
      setLocation("/dashboard");
    },
    onError: (err) => toast.error(err.message || "No se pudo iniciar sesión"),
  });

  useEffect(() => {
    if (!loading && user) setLocation("/dashboard");
  }, [loading, user, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ingreso (Demo)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Usuario</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="1000831233"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Clave</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="1000831233"
              autoComplete="current-password"
            />
          </div>

          <Button
            className="w-full"
            onClick={() => loginMutation.mutate({ username, password })}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          <p className="text-xs text-gray-500">
            * Esto es un login de prueba (beta). No usar en producción.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
