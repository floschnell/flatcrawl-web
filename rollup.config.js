'use strict';

import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript";
import replace from "rollup-plugin-replace";
import npm from "rollup-plugin-node-resolve";
import json from "rollup-plugin-json";
import md from "rollup-plugin-md";
import copy from 'rollup-plugin-copy'

export default {
  input: 'src/index.tsx',
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    copy({
      targets: [{
        src: './src/img/**',
        dest: './public/img/'
      }]
    }),
    md({
      marked: {}
    }),
    json(),
    npm({
      browser: true,
    }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/leaflet/dist/leaflet-src.js': [
          "icon",
          "Map",
          "latLngBounds",
          "Control",
          "Marker",
          "Popup",
          "Tooltip",
          "TileLayer",
          "ImageOverlay",
          "VideoOverlay",
          "Path",
          "Polyline",
          "Polygon",
          "Rectangle",
          "Circle",
          "CircleMarker",
          "SVG",
          "Canvas",
          "LayerGroup",
          "FeatureGroup",
          "GeoJSON",
          "GridLayer",
          "LatLng",
          "LatLngBounds",
          "Point",
          "Bounds",
          "Icon",
          "DivIcon",
          "Zoom",
          "Attribution",
          "Layers",
          "Scale",
          "Browser",
          "Util",
          "Transformation",
          "LineUtil",
          "PolyUtil",
          "DomEvent",
          "DomUtil",
          "PosAnimation",
          "Draggable",
        ],
        'node_modules/@material-ui/core/styles/index.js': [
          'withStyles',
        ],
        'node_modules/react-dom/index.js': [
          'render',
          'createPortal',
        ],
        'node_modules/react/index.js': [
          'React',
          'Component',
          'PropTypes',
          'createElement',
          'createContext',
          'forwardRef',
          'Children',
          'cloneElement',
          'Fragment',
        ],
      },
    }),
    typescript({
      resolveJsonModule: false,
    }),
  ],
  output: {
    file: './public/dist/bundle.js',
    format: 'iife',
    name: 'flatcrawlWeb'
  },
}