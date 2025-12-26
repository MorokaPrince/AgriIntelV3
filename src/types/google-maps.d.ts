/**
 * Google Maps Type Declarations for AgrIntelV3
 * This provides TypeScript support for Google Maps API
 */

declare global {
  namespace google.maps {
    class Map {
      constructor(container: HTMLElement, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
      setZoom(zoom: number): void;
      getZoom(): number;
      fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
      getBounds(): LatLngBounds | undefined;
      controls: Array<MVCArray<Node>>;
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
      toString(): string;
      equals(other: LatLng): boolean;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      extend(point: LatLng | LatLngLiteral): void;
      contains(point: LatLng | LatLngLiteral): boolean;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
    }

    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId;
      gestureHandling?: string;
      fullscreenControl?: boolean;
      streetViewControl?: boolean;
      mapTypeControl?: boolean;
      zoomControl?: boolean;
      styles?: MapTypeStyle[];
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map | undefined;
      title?: string;
      icon?: string | Icon;
      label?: string | MarkerLabel;
      clickable?: boolean;
      zIndex?: number;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setTitle(title: string): void;
      getTitle(): string;
      setIcon(icon: string | Icon): void;
      setLabel(label: string | MarkerLabel): void;
      addListener(eventName: string, handler: () => void): void;
    }

    interface Icon {
      url: string;
      size?: Size;
      origin?: Point;
      anchor?: Point;
      scaledSize?: Size;
      labelOrigin?: Point;
    }

    interface MarkerLabel {
      text: string;
      color?: string;
      fontSize?: string;
      fontWeight?: string;
      className?: string;
    }

    interface PolygonOptions {
      paths?: Array<LatLng | LatLngLiteral> | MVCArray<LatLng | LatLngLiteral>;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      fillColor?: string;
      fillOpacity?: number;
      clickable?: boolean;
      editable?: boolean;
      zIndex?: number;
    }

    class Polygon {
      constructor(opts?: PolygonOptions);
      setMap(map: Map | null): void;
      getPaths(): MVCArray<MVCArray<LatLng>>;
      setPaths(paths: Array<LatLng | LatLngLiteral> | MVCArray<LatLng | LatLngLiteral>): void;
      addListener(eventName: string, handler: () => void): void;
    }

    interface InfoWindowOptions {
      content?: string | Node;
      position?: LatLng | LatLngLiteral;
      maxWidth?: number;
      pixelOffset?: Size;
      zIndex?: number;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map: Map | null, anchor?: Marker): void;
      close(): void;
      setContent(content: string | Node): void;
      getContent(): string | Node;
      setPosition(position: LatLng | LatLngLiteral): void;
      getPosition(): LatLng;
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
    }

    class Size {
      constructor(width: number, height: number);
      width: number;
      height: number;
    }

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers?: Array<{
        color?: string;
        visibility?: string;
        weight?: number;
        gamma?: number;
        hue?: string;
        invert_lightness?: boolean;
        saturation?: number;
        lightness?: number;
      }>;
    }

    interface GroundOverlayOptions {
      url: string;
      bounds: LatLngBounds | LatLngBoundsLiteral;
      clickable?: boolean;
      opacity?: number;
    }

    class GroundOverlay {
      constructor(opts: GroundOverlayOptions);
      setMap(map: Map | null): void;
      getBounds(): LatLngBounds;
      setBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
    }

    interface HeatmapLayerOptions {
      data: Array<LatLng | LatLngLiteral> | MVCArray<LatLng | LatLngLiteral>;
      map: Map | null;
      radius?: number;
      opacity?: number;
      gradient?: string[];
    }

    class HeatmapLayer {
      constructor(opts: HeatmapLayerOptions);
      setMap(map: Map | null): void;
      setData(data: Array<LatLng | LatLngLiteral> | MVCArray<LatLng | LatLngLiteral>): void;
    }

    class MVCArray<T> extends Array<T> {
      constructor(array?: T[]);
      push(item: T): number;
      getAt(index: number): T;
      setAt(index: number, value: T): void;
      insertAt(index: number, value: T): void;
      removeAt(index: number): T;
      clear(): void;
      forEach(callback: (item: T, index: number) => void): void;
    }

    class ControlPosition {
      static TOP_LEFT: number;
      static TOP_CENTER: number;
      static TOP_RIGHT: number;
      static LEFT_TOP: number;
      static RIGHT_TOP: number;
      static LEFT_CENTER: number;
      static RIGHT_CENTER: number;
      static LEFT_BOTTOM: number;
      static RIGHT_BOTTOM: number;
      static BOTTOM_LEFT: number;
      static BOTTOM_CENTER: number;
      static BOTTOM_RIGHT: number;
    }

    class MapTypeId {
      static ROADMAP: string;
      static SATELLITE: string;
      static HYBRID: string;
      static TERRAIN: string;
    }

    // Visualization library
    namespace visualization {
      interface HeatmapLayerOptions {
        data: Array<LatLng | LatLngLiteral> | MVCArray<LatLng | LatLngLiteral>;
        map: Map | null;
        radius?: number;
        opacity?: number;
        gradient?: string[];
      }

      class HeatmapLayer {
        constructor(opts: HeatmapLayerOptions);
        setMap(map: Map | null): void;
        setData(data: Array<LatLng | LatLngLiteral> | MVCArray<LatLng | LatLngLiteral>): void;
      }
    }
  }

  interface Window {
    google: {
      maps: typeof google.maps;
    };
    initMap: () => void;
  }
}

export {};