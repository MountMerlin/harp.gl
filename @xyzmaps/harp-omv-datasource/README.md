# @xyzmaps/harp-omv-datasource

## Overview

This module provides the implementation of [HERE](https://www.here.com)'s
Optimized Map for Visualization (OMV) Datasource.

This format follows the [Vector Tile Specification](https://github.com/mapbox/vector-tile-spec/).
This JSON format contains geometries, such as points and lines that define polygons, labels,
such as road names or city names, and other kinds of data that are typically passed to a renderer to draw a map.

Each tile is encoded using [Protobuf](https://github.com/google/protobuf).

## REST Clients

### XYZ maps data hub tiles

REST services implemented with `APIFormat.XYZMVT`, `APIFormat.XYZJson` and `APIFormat.XYZOMV` in `OmvRestClient.ts`.

The XYZ maps Services offer these variants:

* MVT: offer [Open Street Map Data](https://www.openstreetmap.org) tiles in MVT Format.
* JSON: offer [Open Street Map Data](https://www.openstreetmap.org) tiles in JSON Format.

You can find more about the HERE XYZ Services [here](https://www.here.xyz/).

### Mapbox Vector Tiles

REST service implemented with `APIFormat.MapboxV7` in `OmvRestClient.ts`.

You can find more information [here](https://docs.mapbox.com/vector-tiles/reference/).

## Tom Tom Vector Tiles

You can find more information [here](https://developer.tomtom.com/maps-api/maps-api-documentation-vector/tile).

## Usage of REST APIs and authentication

It is not within the scope of `harp.gl` to provide credentials to all of the services implemented above, but following the links you can do it by yourself.
On our [Getting Started Guide](../../docs/GettingStartedGuide.md) there is more information about getting credentials for HERE Services.
