import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface Props {
  onLogin: (u: string, p: string) => boolean;
}

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const ok = onLogin(username.trim(), password);
      if (!ok) setError("Invalid username or password.");
      setLoading(false);
    }, 300);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #1A0A10 0%, #5C1E30 50%, #2A0F18 100%)",
      }}
    >
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #E0CC8F)",
              color: "#1A0A10",
            }}
          >
            CR
          </div>
          <h1 className="text-4xl font-bold text-white tracking-wider">
            CENTURY ROOMS
          </h1>
          <p className="text-sm mt-2" style={{ color: "#C9A84C" }}>
            Where Comfort Meets Convenience
          </p>
        </div>
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(201,168,76,0.3)",
          }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            Sign In to Your Account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-gray-300 text-sm mb-1 block">
                Username
              </Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-yellow-400"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-sm mb-1 block">
                Password
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-yellow-400"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3 text-base rounded-xl"
              style={{
                background: "linear-gradient(135deg, #C9A84C, #B8943C)",
                color: "#1A0A10",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-center text-gray-400 text-xs mt-4">
            Century Rooms — Expense & Invoice Management
          </p>
        </div>
      </div>
    </div>
  );
}
