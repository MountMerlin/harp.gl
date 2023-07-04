/*
 * Copyright (C) 2023-     XYZ maps contributors
 * Copyright (C) 2020-2021 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { GeoJson, Theme } from "@xyzmaps/harp-datasource-protocol";
import { GeoJsonDataProvider } from "@xyzmaps/harp-geojson-datasource";
import { Projection } from "@xyzmaps/harp-geoutils";
import { LookAtParams, MapView, MapViewEventNames } from "@xyzmaps/harp-mapview";
import { DataProvider } from "@xyzmaps/harp-mapview-decoder";
import { GeoJsonTiler } from "@xyzmaps/harp-mapview-decoder/index-worker";
import { RenderingTestHelper, waitForEvent } from "@xyzmaps/harp-test-utils";
import { VectorTileDataSource } from "@xyzmaps/harp-vectortile-datasource";
import { VectorTileDecoder } from "@xyzmaps/harp-vectortile-datasource/index-worker";
import * as sinon from "sinon";

export interface GeoJsonDataSourceTestOptions {
    geoJson?: string | GeoJson;
    tileGeoJson?: boolean;
    dataProvider?: DataProvider;
    dataSourceOrder?: number;
}
export interface GeoJsonTestOptions extends GeoJsonDataSourceTestOptions {
    mochaTest: Mocha.Context;
    testImageName: string;
    theme: Theme;
    geoJson?: string | GeoJson;
    lookAt?: Partial<LookAtParams>;
    tileGeoJson?: boolean;
    dataProvider?: DataProvider;
    extraDataSource?: GeoJsonDataSourceTestOptions;
    beforeFinishCallback?: (mapView: MapView) => void;
    size?: number;
    projection?: Projection;
}

function createDataSource(
    name: string,
    options: GeoJsonDataSourceTestOptions
): VectorTileDataSource {
    const tiler = new GeoJsonTiler();
    if (options.tileGeoJson === false) {
        sinon.stub(tiler, "getTile").resolves(options.geoJson);
    }

    return new VectorTileDataSource({
        decoder: new VectorTileDecoder(),
        dataProvider:
            options.dataProvider ??
            new GeoJsonDataProvider(
                "geojson",
                typeof options.geoJson === "string"
                    ? new URL(options.geoJson, window.location.href)
                    : options.geoJson!,
                { tiler }
            ),
        name,
        styleSetName: "geojson",
        dataSourceOrder: options.dataSourceOrder
    });
}

export class GeoJsonTest {
    mapView!: MapView;

    dispose() {
        this.mapView?.dispose();
    }

    async run(options: GeoJsonTestOptions) {
        const ibct = new RenderingTestHelper(options.mochaTest, { module: "mapview" });
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 300;

        this.mapView = new MapView({
            canvas,
            theme: options.theme,
            preserveDrawingBuffer: true,
            pixelRatio: 1,
            disableFading: true,
            projection: options.projection
        });
        this.mapView.animatedExtrusionHandler.enabled = false;

        const defaultLookAt: Partial<LookAtParams> = {
            target: { lat: 53.3, lng: 14.6 },
            distance: 200000,
            tilt: 0,
            heading: 0
        };

        const lookAt: LookAtParams = { ...defaultLookAt, ...options.lookAt } as any;

        this.mapView.lookAt(lookAt);
        // Shutdown errors cause by firefox bug
        this.mapView.renderer.getContext().getShaderInfoLog = (x: any) => {
            return "";
        };

        const tiler = new GeoJsonTiler();
        if (options.tileGeoJson === false) {
            sinon.stub(tiler, "getTile").resolves(options.geoJson);
        }

        const dataSource = createDataSource("geojson", options);

        this.mapView.setDynamicProperty("enabled", true);
        if (options.size) {
            this.mapView.setDynamicProperty("size", options.size);
        }
        await this.mapView.addDataSource(dataSource);

        if (options.extraDataSource) {
            await this.mapView.addDataSource(createDataSource("geojson2", options.extraDataSource));
        }

        if (options.beforeFinishCallback) {
            await options.beforeFinishCallback?.(this.mapView);
        }
        await waitForEvent(this.mapView, MapViewEventNames.FrameComplete);
        await ibct.assertCanvasMatchesReference(canvas, options.testImageName);
    }
}
