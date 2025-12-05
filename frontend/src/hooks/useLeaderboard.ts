import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";
import type { LeaderboardEntry, LeaderboardQueryParams, LeaderboardResponse } from "../types/leaderboard";

type UseLeaderboardResult = UseQueryResult<LeaderboardResponse, Error> & {
  entries: LeaderboardEntry[];
  total: number;
  pageCount: number;
  updatedAt: number | null;
  pageSize: number;
};

const PAGE_SIZE = 50;

const MOCK_USERNAMES = [
  "NeonFox",
  "LunaShade",
  "CryptoWolf",
  "AstraPulse",
  "PixelSavant",
  "Zenith",
  "Orbit",
  "Nova",
  "Thorn",
  "Volt",
];

const generateMockEntries = (count: number, page: number): LeaderboardEntry[] =>
  Array.from({ length: count }, (_, idx) => {
    const rank = (page - 1) * PAGE_SIZE + idx + 1;
    const wins = Math.floor(Math.random() * 350);
    const losses = Math.floor(Math.random() * 250);
    const xp = wins * 42 + Math.floor(Math.random() * 1200);
    const winRate = wins + losses === 0 ? 0 : Math.round((wins / (wins + losses)) * 100);

    return {
      rank,
      wallet: `5EY${rank.toString().padStart(3, "0")}...${rank.toString().padStart(3, "0")}`,
      username: MOCK_USERNAMES[rank % MOCK_USERNAMES.length] ?? `Player${rank}`,
      xp,
      wins,
      losses,
      winRate,
      streak: Math.floor(Math.random() * 10),
    };
  });

const mockFetchLeaderboard = async ({ page }: LeaderboardQueryParams): Promise<LeaderboardResponse> => {
  const entries = generateMockEntries(PAGE_SIZE, page);
  return {
    entries,
    total: 200,
    seasonId: 1,
    updatedAt: Date.now(),
  };
};

const buildUrl = ({ scope, page, pageSize, seasonId, search }: LeaderboardQueryParams, base: string) => {
  const path = scope === "global" ? "/api/leaderboard/global" : `/api/leaderboard/season/${seasonId ?? 1}`;
  const url = new URL(path, base);
  url.searchParams.set("limit", String(pageSize));
  url.searchParams.set("offset", String((page - 1) * pageSize));
  if (search) {
    url.searchParams.set("search", search);
  }
  return url.toString();
};

const fetchLeaderboard = async (params: LeaderboardQueryParams): Promise<LeaderboardResponse> => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (!backendUrl) {
    return mockFetchLeaderboard(params);
  }

  try {
    const response = await fetch(buildUrl(params, backendUrl));
    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard data");
    }
    const payload = (await response.json()) as LeaderboardResponse;
    return payload;
  } catch (error) {
    console.warn("Leaderboard fetch failed, falling back to mock data", error);
    return mockFetchLeaderboard(params);
  }
};

export const useLeaderboard = (params: Omit<LeaderboardQueryParams, "pageSize">): UseLeaderboardResult => {
  const queryParams: LeaderboardQueryParams = {
    ...params,
    pageSize: PAGE_SIZE,
  };

  const query = useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard", queryParams],
    queryFn: () => fetchLeaderboard(queryParams),
    refetchInterval: 30000,
    staleTime: 25000,
    placeholderData: keepPreviousData,
  });

  const pageCount = useMemo(() => Math.ceil((query.data?.total ?? 0) / PAGE_SIZE) || 1, [query.data?.total]);

  return {
    ...query,
    entries: query.data?.entries ?? [],
    total: query.data?.total ?? 0,
    pageCount,
    updatedAt: query.data?.updatedAt ?? null,
    pageSize: PAGE_SIZE,
  };
};
