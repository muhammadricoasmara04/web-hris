"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type Coordinates = {
  lat: number;
  lng: number;
};

type UseCurrentLocationOptions = {
  defaultCenter?: Coordinates;
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
};

type UseCurrentLocationResult = {
  coordinates: Coordinates;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  isSupported: boolean;
  requestLocation: () => void;
};

const FALLBACK_CENTER: Coordinates = {
  lat: -6.2,
  lng: 106.816666,
};

const GEOLOCATION_ERROR_MESSAGES: Record<number, string> = {
  1: "Akses lokasi ditolak. Izinkan lokasi agar peta bisa menemukan posisi Anda.",
  2: "Lokasi tidak tersedia. Coba aktifkan GPS atau jaringan internet Anda.",
  3: "Permintaan lokasi melebihi batas waktu. Silakan coba lagi.",
};

const UNSUPPORTED_BROWSER_MESSAGE =
  "Browser ini belum mendukung geolocation.";

export function useCurrentLocation(
  options: UseCurrentLocationOptions = {},
): UseCurrentLocationResult {
  const {
    defaultCenter = FALLBACK_CENTER,
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
  } = options;

  const isSupported = typeof window !== "undefined" && "geolocation" in navigator;
  const [coordinates, setCoordinates] = useState<Coordinates>(defaultCenter);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(isSupported);
  const [error, setError] = useState<string | null>(
    isSupported ? null : UNSUPPORTED_BROWSER_MESSAGE,
  );

  const locationOptions = useMemo(
    () => ({
      enableHighAccuracy,
      timeout,
      maximumAge,
    }),
    [enableHighAccuracy, maximumAge, timeout],
  );

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setCoordinates({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });
    setAccuracy(position.coords.accuracy ?? null);
    setLoading(false);
  }, []);

  const handleError = useCallback((geoError: GeolocationPositionError) => {
    setError(
      GEOLOCATION_ERROR_MESSAGES[geoError.code] ??
        "Terjadi kendala saat mengambil lokasi Anda.",
    );
    setLoading(false);
  }, []);

  const requestLocation = useCallback(() => {
    if (!isSupported) {
      setError(UNSUPPORTED_BROWSER_MESSAGE);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      locationOptions,
    );
  }, [handleError, handleSuccess, isSupported, locationOptions]);

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      locationOptions,
    );
  }, [handleError, handleSuccess, isSupported, locationOptions]);

  return useMemo(
    () => ({
      coordinates,
      accuracy,
      loading,
      error,
      isSupported,
      requestLocation,
    }),
    [accuracy, coordinates, error, isSupported, loading, requestLocation],
  );
}
