import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  FlaskConical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDrugCount } from "@/data/drugDatabase";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import {
  fetchAnalytics,
  subscribeToAnalytics,
  type AnalyticsSnapshot,
} from "@/services/analyticsService";

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsSnapshot | null>(null);

  useEffect(() => {
    fetchAnalytics()
      .then((data) => {
        setStats(data);
      })
      .catch((error) => {
        console.error("Failed to fetch analytics", error);
      });

    const unsubscribe = subscribeToAnalytics((data) => {
      setStats(data);
    });

    return () => unsubscribe();
  }, []);

  // ── Chart data ────────────────────────────────────────────────────────────

  const compatibilityData = stats
    ? [
        {
          name:  "Compatible",
          value: stats.compatible,
          color: "hsl(145, 65%, 40%)",   // green
        },
        {
          name:  "Partially Compatible",
          value: stats.partiallyCompatible,
          color: "hsl(38, 92%, 50%)",    // amber
        },
        {
          name:  "Incompatible",
          value: stats.incompatible,
          color: "hsl(0, 72%, 50%)",     // red
        },
      ].filter((d) => d.value > 0)      // hide zero slices so chart is clean
    : [];

  // ── Helpers ───────────────────────────────────────────────────────────────

  const pct = (n: number) =>
    stats && stats.totalPredictions > 0
      ? ((n / stats.totalPredictions) * 100).toFixed(1) + "%"
      : "—";

  // ─────────────────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Analytics Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground">
          Platform usage statistics and prediction analytics
        </p>
      </div>

      {/* ── Top stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {/* Total Predictions */}
        <Card className="border-border shadow-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Total Predictions
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                  {stats ? stats.totalPredictions.toLocaleString() : "—"}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-primary/10">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compatible */}
        <Card className="border-border shadow-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Compatible
                </p>
                <p className="text-xl sm:text-2xl font-bold text-[hsl(145,65%,40%)] mt-1">
                  {stats ? stats.compatible.toLocaleString() : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats ? pct(stats.compatible) : ""}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-[hsl(145,60%,94%)]">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(145,65%,40%)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partially Compatible */}
        <Card className="border-border shadow-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Partially Compatible
                </p>
                <p className="text-xl sm:text-2xl font-bold text-[hsl(38,92%,45%)] mt-1">
                  {stats ? stats.partiallyCompatible.toLocaleString() : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats ? pct(stats.partiallyCompatible) : ""}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-[hsl(38,92%,93%)]">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(38,92%,45%)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incompatible */}
        <Card className="border-border shadow-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Incompatible
                </p>
                <p className="text-xl sm:text-2xl font-bold text-destructive mt-1">
                  {stats ? stats.incompatible.toLocaleString() : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats ? pct(stats.incompatible) : ""}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-[hsl(0,70%,95%)]">
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Compatibility pie */}
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Compatibility Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              {compatibilityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={compatibilityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {compatibilityData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        value.toLocaleString(),
                        "Predictions",
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No prediction data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Visitors + breakdown summary */}
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Platform Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">

            {/* Visitors */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-accent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Total Visitors
                </span>
              </div>
              <span className="text-xl font-bold text-foreground">
                {stats ? stats.totalVisitors.toLocaleString() : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>





      {/* ── Bottom row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4">

        {/* Database size */}
        <Card className="border-border shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Database Size</p>
                <p className="text-xl font-bold text-foreground">
                  {getDrugCount().toLocaleString()} compounds
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Analytics;
