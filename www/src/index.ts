/*
 * Copyright (C) 2023-     XYZ maps contributors
 * Copyright (C) 2020-2021 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import { Theme } from "@xyzmaps/harp-datasource-protocol";
import { GeoCoordinates } from "@xyzmaps/harp-geoutils";
import { MapView, MapViewEventNames, MapViewUtils } from "@xyzmaps/harp-mapview";
import { VectorTileDataSource } from "@xyzmaps/harp-vectortile-datasource";

const theme = require("../resources/theme.json");

import "../css/index.css";


function main() {
    const canvas = document.getElementById("map") as HTMLCanvasElement;
    const map = new MapView({
        canvas,
        decoderUrl: "decoder.bundle.js",
        theme: (theme as unknown) as Theme,
        maxVisibleDataSourceTiles: 40,
        enableMixedLod: false,
        tileCacheSize: 100
    });
    map.animatedExtrusionHandler.enabled = false;

    const omvDataSource = new VectorTileDataSource({
        url: "https://demo.xyzmaps.org/maps/osm/{z}/{x}/{y}.pbf",
        styleSetName: "tilezen"
        // copyrightInfo
    });
    map.addDataSource(omvDataSource);

    map.resize(window.innerWidth, 500);
    window.addEventListener("resize", () => map.resize(window.innerWidth, 500));

    const zoomLevel = MapViewUtils.calculateZoomLevelFromDistance(map, 1400);
    const Boston = new GeoCoordinates(42.361145, -71.057083);
    const options = { target: Boston, zoomLevel, tilt: 34.3, heading: 135 };
    map.lookAt(options);

    const onFrameComplete = () => {
        // FrameComplete is fired multiple times (each time the camera changes and the tiles are
        // loaded), hence we just set the Render event listener once below.
        map.removeEventListener(MapViewEventNames.FrameComplete, onFrameComplete);
        canvas.style.opacity = "1";

        map.addEventListener(MapViewEventNames.Render, () =>
            map.lookAt({ heading: map.heading + 0.1 })
        );
        setTimeout(() => {
            map.beginAnimation();
        }, 0.5);
    };
    map.addEventListener(MapViewEventNames.FrameComplete, onFrameComplete);
}

main();
