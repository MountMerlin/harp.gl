/*
 * Copyright (C) 2023-     XYZ maps contributors
 * Copyright (C) 2020-2021 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { EarthConstants, GeoCoordinates, sphereProjection } from "@xyzmaps/harp-geoutils";
import { MapControls, MapControlsUI } from "@xyzmaps/harp-map-controls";
import {
    AtmosphereLightMode,
    CopyrightElementHandler,
    MapView,
    MapViewAtmosphere
} from "@xyzmaps/harp-mapview";
import { VectorTileDataSource } from "@xyzmaps/harp-vectortile-datasource";

export namespace GlobeAtmosphereExample {
    // Create a new MapView for the HTMLCanvasElement of the given id.
    function initializeMapView(id: string): MapView {
        const canvas = document.getElementById(id) as HTMLCanvasElement;
        const mapView = new MapView({
            canvas,
            projection: sphereProjection,
            theme: "resources/berlin_tilezen_base_globe.json"
        });
        CopyrightElementHandler.install("copyrightNotice", mapView);

        mapView.resize(window.innerWidth, window.innerHeight);

        window.addEventListener("resize", () => {
            mapView.resize(window.innerWidth, window.innerHeight);
        });

        return mapView;
    }

    function main() {
        const map = initializeMapView("mapCanvas");

        const dataSource = new VectorTileDataSource({
            url: "https://demo.xyzmaps.org/maps/osm/{z}/{x}/{y}.pbf"
        });
        map.addDataSource(dataSource);

        const mapControls = new MapControls(map);
        mapControls.maxTiltAngle = 90;
        const ui = new MapControlsUI(mapControls, { zoomLevel: "input" });
        map.canvas.parentElement!.appendChild(ui.domElement);

        const { camera, projection, mapAnchors } = map;
        const updateCallback = () => map.update();
        const atmosphere = new MapViewAtmosphere(
            mapAnchors,
            camera,
            projection,
            map.renderer.capabilities,
            updateCallback
        );
        atmosphere.lightMode = AtmosphereLightMode.LightDynamic;

        const coords = new GeoCoordinates(10.0, -10.0);
        map.lookAt({ target: coords, distance: EarthConstants.EQUATORIAL_RADIUS * 2.1 });
    }

    main();
}
