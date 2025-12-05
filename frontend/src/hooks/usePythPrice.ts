import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PriceFeedData } from "../types/game";

const PYTH_SOL_PRICE_FEED_ID = "0xe62df6c4a0e6457a13af5ed1c274b53ce8f76a25f70d7e8f90f00ad1f8f5f51";

interface HermesPriceFeed {
  id: string;
  price: {
    price: number;
    conf: number;
    expo: number;
    publish_time: number;
  };
  ema_price?: {
    price: number;
    expo: number;
  };
}

const hermesEndpoint = `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${PYTH_SOL_PRICE_FEED_ID}`;

const toDecimal = (value: number, expo: number) => value * Math.pow(10, expo);

const fetchPythPrice = async (): Promise<PriceFeedData> => {
  const response = await fetch(hermesEndpoint);
  if (!response.ok) {
    throw new Error("Failed to fetch SOL price from Pyth");
  }

  const payload = (await response.json()) as HermesPriceFeed[];
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error("Pyth price feed returned empty payload");
  }

  const feed = payload[0];
  if (!feed) {
    throw new Error("Missing SOL/USD feed data from Pyth");
  }
  const parsedPrice = toDecimal(feed.price.price, feed.price.expo);
  const emaPrice = feed.ema_price ? toDecimal(feed.ema_price.price, feed.ema_price.expo) : parsedPrice;
  const changePct = emaPrice ? ((parsedPrice - emaPrice) / emaPrice) * 100 : null;

  return {
    feedId: feed.id,
    price: parsedPrice,
    confidence: toDecimal(feed.price.conf, feed.price.expo),
    lastUpdated: feed.price.publish_time * 1000,
    changePct,
  };
};

export const usePythPrice = () => {
  const lastPriceRef = useRef<number | null>(null);
  const [deltaPct, setDeltaPct] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ["pyth-price", PYTH_SOL_PRICE_FEED_ID],
    queryFn: fetchPythPrice,
    refetchInterval: 5000,
    staleTime: 4000,
  });

  useEffect(() => {
    if (!query.data) {
      return;
    }

    const previous = lastPriceRef.current;
    if (previous !== null && previous !== 0) {
      setDeltaPct(((query.data.price - previous) / previous) * 100);
    }

    lastPriceRef.current = query.data.price;
  }, [query.data]);

  return {
    ...query,
    price: query.data?.price ?? null,
    confidence: query.data?.confidence ?? null,
    lastUpdated: query.data?.lastUpdated ?? null,
    changePct: query.data?.changePct ?? deltaPct ?? null,
  };
};
