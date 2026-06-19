import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import Supercluster from 'supercluster';
import {
  type JourneyStop,
  type Activity,
  type ActivityType,
  journeyStops,
  activities,
  TYPE_COLORS,
} from '../data/tripData';
import {
  milfordDaySegments,
  milfordWaypoints,
  MILFORD_STOP_ID,
  MILFORD_ACTIVITY_IDS,
} from '../data/milfordTrackData';
import { bucketListItems } from '../data/bucketList';
import {
  getMapboxToken,
  getMapboxStyleUrl,
  logBasemapInfo,
} from '../lib/mapboxTiles';
import {
  toLngLat,
  isValidCoord,
  isValidCoordArray,
  lineToGeoJSON,
  boundsFromCoords,
} from '../lib/geo';

interface ActivityTrace {
  stravaId: string;
  appId: string | null;
  name: string;
  type: string;
  date: string;
  trip: string;
  coords: [number, number][];
}

interface WorldMapProps {
  showAllActivities: boolean;
  selectedStopId: number | null;
  selectedActivityId: string | null;
  activeTypeFilter: ActivityType | null;
  onStopClick: (stop: JourneyStop) => void;
  onActivityClick: (activity: Activity) => void;
}

const COUNTRY_COLORS: Record<string, string> = {
  nz: '#C4A35A',
  fr: '#5B7EC4',
  de: '#5B7EC4',
  ch: '#5B7EC4',
  it: '#5B7EC4',
  us: '#DE6952',
};

const CLUSTER_DISABLE_ZOOM = 4;
const FLY_DURATION_MS = 1500;

function zoomForStop(stop: JourneyStop): number {
  return stop.countryId === 'nz' ? 9 : stop.countryId === 'us' ? 10 : 8;
}

function buildStopDisplayNumbers(stops: JourneyStop[]): Map<number, number> {
  const map = new Map<number, number>();
  const counters: Record<string, number> = {};
  for (const stop of stops) {
    if (stop.departure) continue;
    counters[stop.countryId] = (counters[stop.countryId] ?? 0) + 1;
    map.set(stop.id, counters[stop.countryId]);
  }
  return map;
}

function emptyFeatureCollection(): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features: [] };
}

function createHtmlMarker(
  lngLat: [number, number],
  html: string,
  onClick?: () => void
): mapboxgl.Marker {
  const el = document.createElement('div');
  el.className = 'custom-map-marker';
  el.innerHTML = html;
  if (onClick) {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
  }
  return new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat(lngLat);
}

function createClusterMarker(
  lngLat: [number, number],
  count: number,
  onClick: () => void
): mapboxgl.Marker {
  const el = document.createElement('div');
  el.className = 'map-cluster-marker';
  el.innerHTML = `<div>${count}</div>`;
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });
  return new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat(lngLat);
}

type ClusterPointProps = {
  kind: 'activity' | 'stop';
  activityId?: string;
  stopId?: number;
};

function setupMapLayers(map: mapboxgl.Map): void {
  if (map.getSource('traces-bg')) return;

  map.addSource('traces-bg', {
    type: 'geojson',
    data: emptyFeatureCollection(),
  });
  map.addLayer({
    id: 'traces-bg-line',
    type: 'line',
    source: 'traces-bg',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': [
        'match',
        ['get', 'trip'],
        'north-america',
        '#DE6952',
        '#5A7A8A',
      ],
      'line-opacity': [
        'match',
        ['get', 'trip'],
        'north-america',
        0.45,
        0.35,
      ],
      'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1.5, 12, 3, 16, 5],
    },
  });

  map.addSource('traces-selected-outline', {
    type: 'geojson',
    data: emptyFeatureCollection(),
  });
  map.addLayer({
    id: 'traces-selected-outline',
    type: 'line',
    source: 'traces-selected-outline',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#FFFFFF',
      'line-width': ['interpolate', ['linear'], ['zoom'], 10, 5, 14, 8, 16, 10],
      'line-opacity': 0.9,
    },
  });

  map.addSource('traces-selected-core', {
    type: 'geojson',
    data: emptyFeatureCollection(),
  });
  map.addLayer({
    id: 'traces-selected-core',
    type: 'line',
    source: 'traces-selected-core',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': ['coalesce', ['get', 'color'], '#1A3044'],
      'line-width': ['interpolate', ['linear'], ['zoom'], 10, 3, 14, 5, 16, 6],
      'line-opacity': 1,
    },
  });

  map.addSource('milford-segments', {
    type: 'geojson',
    data: emptyFeatureCollection(),
  });
  map.addLayer({
    id: 'milford-segments-line',
    type: 'line',
    source: 'milford-segments',
    paint: {
      'line-color': ['get', 'color'],
      'line-width': ['get', 'weight'],
      'line-opacity': ['get', 'opacity'],
    },
  });
}

export function WorldMap({
  showAllActivities,
  selectedStopId,
  selectedActivityId,
  activeTypeFilter,
  onStopClick,
  onActivityClick,
}: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const clusterIndexRef = useRef<Supercluster<ClusterPointProps> | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const bucketMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const milfordMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [layersReady, setLayersReady] = useState(false);

  const [traceData, setTraceData] = useState<{
    allTraces: ActivityTrace[];
    traceByAppId: Map<string, ActivityTrace>;
  } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const onStopClickRef = useRef(onStopClick);
  const onActivityClickRef = useRef(onActivityClick);
  onStopClickRef.current = onStopClick;
  onActivityClickRef.current = onActivityClick;

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (cancelled) return;
      console.warn('[Overland] GPS trace load timed out — showing map without routes');
      setTraceData({ allTraces: [], traceByAppId: new Map() });
    }, 15000);

    Promise.all([
      fetch('/data/all-traces.json').then((r) => {
        if (!r.ok) throw new Error(`all-traces.json: ${r.status}`);
        return r.json() as Promise<ActivityTrace[]>;
      }),
      fetch('/data/north-america-traces.json').then((r) => {
        if (!r.ok) throw new Error(`north-america-traces.json: ${r.status}`);
        return r.json() as Promise<ActivityTrace[]>;
      }),
    ])
      .then(([allTraces, naTraces]) => {
        if (cancelled) return;
        window.clearTimeout(timeout);
        const merged = [...allTraces, ...naTraces];
        setTraceData({
          allTraces: merged,
          traceByAppId: new Map(
            merged.filter((t) => t.appId).map((t) => [t.appId!, t])
          ),
        });
      })
      .catch((err) => {
        console.error('[Overland] Failed to load GPS traces:', err);
        if (!cancelled) {
          window.clearTimeout(timeout);
          setTraceData({ allTraces: [], traceByAppId: new Map() });
        }
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  const allStops = useMemo(() => journeyStops.filter((s) => !s.departure), []);
  const displayNumbers = useMemo(
    () => buildStopDisplayNumbers(allStops),
    [allStops]
  );
  const visibleActivities = useMemo(() => {
    let filtered = showAllActivities
      ? activities
      : activities.filter((a) => a.highlight);
    if (activeTypeFilter) {
      filtered = filtered.filter((a) => a.type === activeTypeFilter);
    }
    return filtered;
  }, [showAllActivities, activeTypeFilter]);

  /** App IDs whose GPS traces should render on the map */
  const displayTraceAppIds = useMemo(() => {
    const ids = new Set<string>();
    visibleActivities.forEach((a) => ids.add(a.id));
    if (selectedActivityId) ids.add(selectedActivityId);
    if (selectedStopId != null) {
      activities
        .filter((a) => a.stopId === selectedStopId)
        .forEach((a) => ids.add(a.id));
    }
    return ids;
  }, [visibleActivities, selectedActivityId, selectedStopId]);

  const clearMarkers = useCallback((markers: mapboxgl.Marker[]) => {
    markers.forEach((m) => m.remove());
    markers.length = 0;
  }, []);

  const buildActivityIconHtml = useCallback(
    (activity: Activity, isSelected: boolean) => {
      const isHighlight = activity.highlight;
      const r = isHighlight ? 10 : 7;
      const size = isSelected ? r * 1.5 : r;
      return `
        <div style="
          width:${size * 2}px;height:${size * 2}px;
          background-color:${TYPE_COLORS[activity.type]};
          border:2px solid #FFFFFF;border-radius:50%;
          opacity:${isSelected ? 1 : 0.85};
          box-shadow:${isHighlight ? '0 0 8px 2px rgba(222,105,82,0.4)' : '0 1px 3px rgba(0,0,0,0.2)'};
          display:flex;align-items:center;justify-content:center;
          transform:translate(-50%,-50%);
        ">${isHighlight ? '<span style="color:#FFF;font-size:8px;">\u2605</span>' : ''}</div>
      `;
    },
    []
  );

  const buildStopIconHtml = useCallback(
    (stop: JourneyStop, isSelected: boolean, displayNum: number) => {
      const size = isSelected ? 24 : 18;
      const baseBg = COUNTRY_COLORS[stop.countryId] ?? '#C4A35A';
      const bgColor = isSelected ? '#DE6952' : baseBg;
      const ring = isSelected
        ? 'box-shadow:0 0 0 4px rgba(222,105,82,0.25),0 2px 6px rgba(0,0,0,0.3);'
        : 'box-shadow:0 2px 4px rgba(0,0,0,0.3);';
      return `
        <div style="
          width:${size}px;height:${size}px;background-color:${bgColor};
          border:2px solid #FFFFFF;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          color:#FFFFFF;font-weight:700;font-size:${size > 20 ? '10px' : '8px'};
          font-family:'Cabin',sans-serif;transform:translate(-50%,-50%);${ring}
        ">${displayNum}</div>
      `;
    },
    []
  );

  const clusterPoints = useMemo(() => {
    const features: Supercluster.PointFeature<ClusterPointProps>[] = [];

    visibleActivities.forEach((activity) => {
      if (!isValidCoord(activity.coords)) return;
      features.push({
        type: 'Feature',
        properties: { kind: 'activity', activityId: activity.id },
        geometry: {
          type: 'Point',
          coordinates: toLngLat(activity.coords),
        },
      });
    });

    allStops.forEach((stop) => {
      if (!isValidCoord(stop.coords)) return;
      features.push({
        type: 'Feature',
        properties: { kind: 'stop', stopId: stop.id },
        geometry: {
          type: 'Point',
          coordinates: toLngLat(stop.coords),
        },
      });
    });

    return features;
  }, [visibleActivities, allStops]);

  const updateClusterMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    clearMarkers(markersRef.current);

    const zoom = map.getZoom();
    const bounds = map.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const renderActivity = (activityId: string) => {
      const activity = activities.find((a) => a.id === activityId);
      if (!activity || !isValidCoord(activity.coords)) return;
      const isSelected = selectedActivityId === activity.id;
      const marker = createHtmlMarker(
        toLngLat(activity.coords),
        buildActivityIconHtml(activity, isSelected),
        () => onActivityClickRef.current(activity)
      );
      marker.addTo(map);
      markersRef.current.push(marker);
    };

    const renderStop = (stopId: number) => {
      const stop = allStops.find((s) => s.id === stopId);
      if (!stop || !isValidCoord(stop.coords)) return;
      const isSelected = selectedStopId === stop.id;
      const displayNum = displayNumbers.get(stop.id) ?? stop.id;
      const marker = createHtmlMarker(
        toLngLat(stop.coords),
        buildStopIconHtml(stop, isSelected, displayNum),
        () => onStopClickRef.current(stop)
      );
      marker.addTo(map);
      markersRef.current.push(marker);
    };

    if (zoom >= CLUSTER_DISABLE_ZOOM) {
      clusterPoints.forEach((f) => {
        const props = f.properties;
        if (props.kind === 'activity' && props.activityId) {
          renderActivity(props.activityId);
        } else if (props.kind === 'stop' && props.stopId !== undefined) {
          renderStop(props.stopId);
        }
      });
      return;
    }

    const index = clusterIndexRef.current;
    if (!index) return;

    const clusters = index.getClusters(bbox, Math.floor(zoom));
    for (const feature of clusters) {
      const [lng, lat] = feature.geometry.coordinates as [number, number];
      if (feature.properties.cluster) {
        const clusterId = feature.properties.cluster_id as number;
        const count = feature.properties.point_count as number;
        const marker = createClusterMarker([lng, lat], count, () => {
          const expansionZoom = Math.min(
            index.getClusterExpansionZoom(clusterId) + 1,
            18
          );
          map.easeTo({ center: [lng, lat], zoom: expansionZoom, duration: 500 });
        });
        marker.addTo(map);
        markersRef.current.push(marker);
      } else {
        const props = feature.properties;
        if (props.kind === 'activity' && props.activityId) {
          renderActivity(props.activityId);
        } else if (props.kind === 'stop' && props.stopId !== undefined) {
          renderStop(props.stopId);
        }
      }
    }
  }, [
    mapReady,
    clusterPoints,
    selectedActivityId,
    selectedStopId,
    displayNumbers,
    allStops,
    clearMarkers,
    buildActivityIconHtml,
    buildStopIconHtml,
  ]);

  // ── Init map ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    setMapReady(false);
    setMapError(null);

    const token = getMapboxToken();
    if (!token) {
      setMapError(
        import.meta.env.DEV
          ? 'Mapbox token missing. Add VITE_MAPBOX_TOKEN to .env (see .env.example), then restart npm run dev.'
          : 'Mapbox token missing. In your host (Vercel/Netlify), set VITE_MAPBOX_TOKEN to your pk. token, then redeploy — saving env vars alone does not update an existing build.'
      );
      return;
    }

    let cancelled = false;
    logBasemapInfo('light');
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: getMapboxStyleUrl('light'),
      attributionControl: true,
      projection: 'mercator',
    });

    mapInstanceRef.current = map;

    map.on('load', () => {
      if (cancelled) return;
      // Studio / v12 styles often default to globe — override after style loads
      map.setProjection('mercator');
      setupMapLayers(map);
      setLayersReady(true);

      const bounds = boundsFromCoords(allStops.map((s) => s.coords));
      if (bounds) {
        map.fitBounds(bounds, { padding: 60, duration: 0 });
      } else {
        map.setCenter([30, 20]);
        map.setZoom(2);
      }

      setMapReady(true);
      requestAnimationFrame(() => map.resize());
    });

    map.on('error', (e) => {
      console.error('[Overland] Map error:', e);
    });

    return () => {
      cancelled = true;
      setLayersReady(false);
      clearMarkers(markersRef.current);
      clearMarkers(bucketMarkersRef.current);
      clearMarkers(milfordMarkersRef.current);
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const fixSize = () => map.resize();
    fixSize();
    window.addEventListener('resize', fixSize);
    return () => window.removeEventListener('resize', fixSize);
  }, [mapReady]);

  // ── Rebuild supercluster index ──────────────────────────────────────────────
  useEffect(() => {
    const index = new Supercluster<ClusterPointProps>({
      radius: 30,
      maxZoom: CLUSTER_DISABLE_ZOOM - 1,
    });
    index.load(clusterPoints);
    clusterIndexRef.current = index;
    updateClusterMarkers();
  }, [clusterPoints, updateClusterMarkers]);

  // ── Marker clustering on viewport change ────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const onMoveEnd = () => updateClusterMarkers();
    map.on('moveend', onMoveEnd);
    map.on('zoomend', onMoveEnd);
    updateClusterMarkers();

    return () => {
      map.off('moveend', onMoveEnd);
      map.off('zoomend', onMoveEnd);
    };
  }, [mapReady, updateClusterMarkers]);

  // ── Background GPS traces ───────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady || !layersReady || !traceData) return;

    if (!map.getSource('traces-bg')) setupMapLayers(map);

    const features: GeoJSON.Feature[] = traceData.allTraces
      .filter(
        (trace) => !trace.appId || displayTraceAppIds.has(trace.appId)
      )
      .map((trace) => {
        const line = lineToGeoJSON(trace.coords);
        if (line.coordinates.length < 2) return null;
        return {
          type: 'Feature' as const,
          properties: { trip: trace.trip },
          geometry: line,
        };
      })
      .filter((f): f is GeoJSON.Feature => f !== null);

    const source = map.getSource('traces-bg') as mapboxgl.GeoJSONSource | undefined;
    source?.setData({ type: 'FeatureCollection', features });
  }, [traceData, mapReady, layersReady, displayTraceAppIds]);

  // ── Selected GPS trace highlight ──────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady || !layersReady) return;

    const empty = emptyFeatureCollection();
    const outlineSource = map.getSource(
      'traces-selected-outline'
    ) as mapboxgl.GeoJSONSource | undefined;
    const coreSource = map.getSource(
      'traces-selected-core'
    ) as mapboxgl.GeoJSONSource | undefined;

    if (!traceData) {
      outlineSource?.setData(empty);
      coreSource?.setData(empty);
      return;
    }

    if (!map.getSource('traces-selected-outline')) setupMapLayers(map);

    const tracesToHighlight: ActivityTrace[] = [];
    if (selectedActivityId) {
      if (!MILFORD_ACTIVITY_IDS.includes(selectedActivityId)) {
        const trace = traceData.traceByAppId.get(selectedActivityId);
        if (trace) tracesToHighlight.push(trace);
      }
    } else if (selectedStopId) {
      if (selectedStopId !== MILFORD_STOP_ID) {
        activities
          .filter((a) => a.stopId === selectedStopId)
          .forEach((a) => {
            const trace = traceData.traceByAppId.get(a.id);
            if (trace) tracesToHighlight.push(trace);
          });
      }
    }

    const features = tracesToHighlight
      .map((trace) => {
        const line = lineToGeoJSON(trace.coords);
        if (line.coordinates.length < 2) return null;
        const activity = trace.appId
          ? activities.find((a) => a.id === trace.appId)
          : undefined;
        return {
          type: 'Feature' as const,
          properties: {
            color: activity ? TYPE_COLORS[activity.type] : '#1A3044',
          },
          geometry: line,
        };
      })
      .filter((f): f is GeoJSON.Feature => f !== null);

    const fc = { type: 'FeatureCollection' as const, features };
    outlineSource?.setData(fc);
    coreSource?.setData(fc);
  }, [selectedActivityId, selectedStopId, traceData, mapReady, layersReady]);

  // ── Bucket list markers ─────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    clearMarkers(bucketMarkersRef.current);

    bucketListItems.forEach((item) => {
      if (!isValidCoord(item.coords)) return;
      const size = 16;
      const html = `
        <div style="
          width:${size}px;height:${size}px;
          background-color:rgba(255,255,255,0.85);
          border:1.5px dashed #5A7A8A;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          color:#5A7A8A;font-weight:bold;font-size:10px;
          font-family:'Cabin',sans-serif;transform:translate(-50%,-50%);
          box-shadow:0 2px 4px rgba(0,0,0,0.2);
          cursor:pointer;
        ">?</div>
      `;
      const popup = new mapboxgl.Popup({ offset: 12, closeButton: true }).setHTML(
        `<div style="font-family:'Cabin',sans-serif;padding:4px;max-width:200px;">
          <div style="font-size:10px;color:#5A7A8A;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;font-weight:bold;">Bucket List</div>
          <strong style="color:#DE6952;font-size:14px;display:block;margin-bottom:4px;line-height:1.2;">${item.name}</strong>
          <div style="color:#5A7A8A;font-size:11px;margin-bottom:6px;">📍 ${item.location}</div>
          <p style="color:#1A3044;font-size:12px;margin:0;line-height:1.4;opacity:0.85;">${item.desc}</p>
        </div>`
      );
      const marker = createHtmlMarker(toLngLat(item.coords), html);
      marker.setPopup(popup);
      marker.addTo(map);
      bucketMarkersRef.current.push(marker);
    });

    return () => clearMarkers(bucketMarkersRef.current);
  }, [mapReady, clearMarkers]);

  // ── Milford Track ───────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady || !layersReady) return;

    clearMarkers(milfordMarkersRef.current);

    const showMilford =
      selectedStopId === MILFORD_STOP_ID ||
      (selectedActivityId !== null &&
        MILFORD_ACTIVITY_IDS.includes(selectedActivityId));

    const segmentSource = map.getSource(
      'milford-segments'
    ) as mapboxgl.GeoJSONSource | undefined;

    if (!showMilford) {
      segmentSource?.setData(emptyFeatureCollection());
      return;
    }

    let activeBounds: [[number, number], [number, number]] | null = null;

    const segmentFeatures = milfordDaySegments
      .map((segment) => {
        const isActive =
          selectedStopId === MILFORD_STOP_ID ||
          selectedActivityId === segment.activityId;
        const line = lineToGeoJSON(segment.coords);
        if (line.coordinates.length < 2) return null;

        if (isActive) {
          const segBounds = boundsFromCoords(segment.coords);
          if (segBounds) {
            if (!activeBounds) {
              activeBounds = segBounds;
            } else {
              activeBounds = [
                [
                  Math.min(activeBounds[0][0], segBounds[0][0]),
                  Math.min(activeBounds[0][1], segBounds[0][1]),
                ],
                [
                  Math.max(activeBounds[1][0], segBounds[1][0]),
                  Math.max(activeBounds[1][1], segBounds[1][1]),
                ],
              ];
            }
          }
        }

        return {
          type: 'Feature' as const,
          properties: {
            color: segment.color,
            weight: isActive ? 4 : 2.5,
            opacity: isActive ? 0.95 : 0.35,
          },
          geometry: line,
        };
      })
      .filter((f): f is GeoJSON.Feature => f !== null);

    segmentSource?.setData({
      type: 'FeatureCollection',
      features: segmentFeatures,
    });

    milfordWaypoints.forEach((wp, i) => {
      if (!Number.isFinite(wp.lat) || !Number.isFinite(wp.lon)) return;
      const bgColor =
        i === 0
          ? '#DE6952'
          : i === milfordWaypoints.length - 1
            ? '#294050'
            : '#C4A35A';
      const html = `<div style="width:8px;height:8px;background-color:${bgColor};border:2px solid #FFF;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3);transform:translate(-50%,-50%);cursor:pointer;"></div>`;
      const popup = new mapboxgl.Popup({ offset: 8 }).setHTML(
        `<div style="font-family:'Cabin',sans-serif;font-size:12px;padding:2px;"><strong style="color:${bgColor};">${wp.name}</strong><br/><span style="color:#5A6F7E;font-size:11px;">${wp.desc}</span></div>`
      );
      const marker = createHtmlMarker([wp.lon, wp.lat], html);
      marker.setPopup(popup);
      marker.addTo(map);
      milfordMarkersRef.current.push(marker);
    });

    if (activeBounds) {
      map.fitBounds(activeBounds, {
        padding: 60,
        duration: FLY_DURATION_MS,
      });
    }

    return () => {
      clearMarkers(milfordMarkersRef.current);
      segmentSource?.setData(emptyFeatureCollection());
    };
  }, [selectedStopId, selectedActivityId, mapReady, layersReady, clearMarkers]);

  // ── Fly-to / fit-bounds on selection ────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;
    if (selectedStopId === MILFORD_STOP_ID) return;
    if (
      selectedActivityId &&
      MILFORD_ACTIVITY_IDS.includes(selectedActivityId)
    ) {
      return;
    }

    if (selectedActivityId) {
      const trace = traceData?.traceByAppId.get(selectedActivityId);
      if (trace && trace.coords.length >= 2) {
        const validCoords = isValidCoordArray(trace.coords);
        const bounds = boundsFromCoords(validCoords);
        if (bounds) {
          map.fitBounds(bounds, {
            padding: 80,
            maxZoom: 15,
            duration: FLY_DURATION_MS,
          });
          return;
        }
      }
      const activity = activities.find((a) => a.id === selectedActivityId);
      if (activity && isValidCoord(activity.coords)) {
        map.flyTo({
          center: toLngLat(activity.coords),
          zoom: 11,
          duration: FLY_DURATION_MS,
        });
      }
    } else if (selectedStopId) {
      const stop = journeyStops.find((s) => s.id === selectedStopId);
      if (stop && !stop.departure) {
        const stopActivities = activities.filter(
          (a) => a.stopId === selectedStopId
        );
        const allStopCoords: [number, number][] = [];
        stopActivities.forEach((a) => {
          const trace = traceData?.traceByAppId.get(a.id);
          if (trace && trace.coords.length >= 2) {
            allStopCoords.push(...isValidCoordArray(trace.coords));
          } else if (isValidCoord(a.coords)) {
            allStopCoords.push(a.coords);
          }
        });
        const bounds = boundsFromCoords(allStopCoords);
        if (bounds) {
          map.fitBounds(bounds, {
            padding: 80,
            maxZoom: allStopCoords.length > 1 ? 13 : 13,
            duration: FLY_DURATION_MS,
          });
        } else if (isValidCoord(stop.coords)) {
          map.flyTo({
            center: toLngLat(stop.coords),
            zoom: zoomForStop(stop),
            duration: FLY_DURATION_MS,
          });
        }
      }
    } else {
      const bounds = boundsFromCoords(allStops.map((s) => s.coords));
      if (bounds) {
        map.fitBounds(bounds, {
          padding: 60,
          maxZoom: 5,
          duration: 1200,
        });
      }
    }
  }, [selectedStopId, selectedActivityId, allStops, traceData, mapReady]);

  const tracesLoading = traceData === null;

  return (
    <div
      className="relative w-full h-full min-h-0"
      style={{ isolation: 'isolate', zIndex: 0 }}
    >
      <div ref={mapRef} className="absolute inset-0" />

      {mapError && (
        <div
          className="absolute inset-0 z-[500] flex items-center justify-center px-6"
          style={{ backgroundColor: 'var(--color-bg-canvas)' }}
        >
          <p
            className="text-sm text-center max-w-md"
            style={{
              color: 'var(--color-text-secondary)',
              fontFamily: 'Cabin, sans-serif',
            }}
          >
            {mapError}
          </p>
        </div>
      )}

      {!mapReady && !mapError && (
        <div
          className="absolute inset-0 z-[500] flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-bg-canvas)' }}
          aria-live="polite"
          aria-busy="true"
        >
          <div className="text-center">
            <div
              className="w-9 h-9 mx-auto mb-3 rounded-full border-[3px] border-[var(--color-border-default)] border-t-[var(--color-interactive-primary)] animate-spin"
              aria-hidden="true"
            />
            <p
              className="text-sm tracking-wide"
              style={{
                color: 'var(--color-text-secondary)',
                fontFamily: 'Cabin, sans-serif',
              }}
            >
              Initializing map…
            </p>
          </div>
        </div>
      )}

      {mapReady && tracesLoading && (
        <div
          className="absolute top-4 left-4 z-[500] px-3 py-1.5 rounded-lg text-xs shadow-md pointer-events-none"
          style={{
            backgroundColor: 'rgba(255,255,255,0.92)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'Cabin, sans-serif',
          }}
          aria-live="polite"
        >
          Loading routes…
        </div>
      )}

      <div
        className="absolute top-4 right-4 z-[1000] rounded-xl shadow-lg overflow-hidden"
        style={{
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      />

      <div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000] hint-toast pointer-events-none"
        style={{ marginLeft: 115 }}
      >
        <div
          className="px-4 py-2.5 rounded-xl shadow-lg text-xs"
          style={{
            backgroundColor: 'rgba(255,255,255,0.92)',
            color: '#1A3044',
            fontFamily: 'Cabin, sans-serif',
            backdropFilter: 'blur(8px)',
          }}
        >
          Scroll to zoom · drag to pan · click any marker
        </div>
      </div>
    </div>
  );
}
