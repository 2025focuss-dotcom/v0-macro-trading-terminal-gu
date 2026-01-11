"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useQuote(symbol: string) {
  const { data, error, isLoading, mutate } = useSWR(symbol ? `/api/market/quote?symbol=${symbol}` : null, fetcher, {
    refreshInterval: 10000,
  })

  return {
    quote: data?.[0] || null,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useBatchQuotes(symbols: string[]) {
  const symbolList = symbols.join(",")
  const { data, error, isLoading, mutate } = useSWR(
    symbols.length > 0 ? `/api/market/batch-quote?symbols=${symbolList}` : null,
    fetcher,
    { refreshInterval: 10000 },
  )

  return {
    quotes: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useHistoricalData(symbol: string, from?: string, to?: string) {
  let url = `/api/market/historical-price-full/${symbol}`
  if (from) url += `&from=${from}`
  if (to) url += `&to=${to}`

  const { data, error, isLoading } = useSWR(symbol ? url : null, fetcher)

  return {
    historical: data?.historical || [],
    isLoading,
    isError: error,
  }
}

export function useIntradayChart(symbol: string, interval: "1min" | "5min" | "15min" | "30min" | "1hour" = "5min") {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/market/intraday?symbol=${symbol}&interval=${interval}` : null,
    fetcher,
    { refreshInterval: 30000 },
  )

  return {
    candles: data || [],
    isLoading,
    isError: error,
  }
}

export function useForexQuotes() {
  const { data, error, isLoading } = useSWR(`/api/market/forex`, fetcher, {
    refreshInterval: 10000,
  })

  return {
    forex: data || [],
    isLoading,
    isError: error,
  }
}

export function useIndexQuotes() {
  const { data, error, isLoading } = useSWR(`/api/market/indexes`, fetcher, {
    refreshInterval: 10000,
  })

  return {
    indexes: data || [],
    isLoading,
    isError: error,
  }
}

export function useCommodityQuotes() {
  const { data, error, isLoading } = useSWR(`/api/market/commodities`, fetcher, { refreshInterval: 10000 })

  return {
    commodities: data || [],
    isLoading,
    isError: error,
  }
}

export function useFearGreedIndex() {
  const { data, error, isLoading } = useSWR(`/api/market/fear-greed`, fetcher, {
    refreshInterval: 60000,
  })

  return {
    fearGreed: data?.[0] || null,
    isLoading,
    isError: error,
  }
}

export function useSectorPerformance() {
  const { data, error, isLoading } = useSWR(`/api/market/sectors`, fetcher, {
    refreshInterval: 60000,
  })

  return {
    sectors: data || [],
    isLoading,
    isError: error,
  }
}

export function useMarketMovers() {
  const { data, error, isLoading } = useSWR(`/api/market/movers`, fetcher, { refreshInterval: 30000 })

  return {
    gainers: data?.gainers || [],
    losers: data?.losers || [],
    isLoading,
    isError: error,
  }
}

export function useTreasuryRates() {
  const { data, error, isLoading } = useSWR(`/api/market/treasury`, fetcher, {
    refreshInterval: 60000,
  })

  return {
    treasury: data || [],
    isLoading,
    isError: error,
  }
}

export function useEconomicCalendar() {
  const { data, error, isLoading } = useSWR(`/api/market/economic-calendar`, fetcher, {
    refreshInterval: 300000,
  })

  return {
    events: data || [],
    isLoading,
    isError: error,
  }
}
