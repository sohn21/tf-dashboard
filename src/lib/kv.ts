import { Redis } from "@upstash/redis";
import type { DashboardData } from "./types";

const DASHBOARD_KEY = "dashboard:latest";

function getClient(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function getDashboardData(): Promise<DashboardData | null> {
  const client = getClient();
  if (!client) return null;
  try {
    return await client.get<DashboardData>(DASHBOARD_KEY);
  } catch (err) {
    console.error("Failed to read dashboard data from KV", err);
    return null;
  }
}
