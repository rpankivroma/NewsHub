declare module 'react-simple-maps' {
  import React from 'react';

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, any>;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }

  export interface GeographiesProps {
    geography: string;
    children: (arg: { geographies: Geography[] }) => React.ReactNode;
  }

  export interface Geography {
    rsmKey: string;
    properties: {
      name: string;
      [key: string]: any;
    };
    type: string;
    geometry: any;
  }

  export interface GeographyProps {
    key?: string;
    geography: Geography;
    onMouseEnter?: (args?: any) => void;
    onMouseLeave?: (args?: any) => void;
    onClick?: (args?: any) => void;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    style?: {
      default?: Record<string, any>;
      hover?: Record<string, any>;
      pressed?: Record<string, any>;
    };
    [key: string]: any;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
  export const ZoomableGroup: React.FC<any>;
}
