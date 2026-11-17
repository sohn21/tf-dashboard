import { Redis } from "@upstash/redis";
import type { CycleviBoard, DashboardData } from "./types";

const DASHBOARD_KEY = "dashboard:latest";

function getClient(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// 2026-11-17: /cyclevi 보드 전체 — export_public.build_cyclevi_board()
export async function getCycleviBoard(): Promise<CycleviBoard | null> {
  const client = getClient();
  if (!client) return null;
  try {
    return await client.get<CycleviBoard>("cyclevi:latest");
  } catch (err) {
    console.error("Failed to read cyclevi board from KV", err);
    return null;
  }
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
