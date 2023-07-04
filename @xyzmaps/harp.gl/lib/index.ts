/*
 * Copyright (C) 2023-     XYZ maps contributors
 * Copyright (C) 2019-2021 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import { mapBundleMain } from "./BundleMain";

if (!(window as any).THREE) {
    // eslint-disable-next-line no-console
    console.warn(
        "harp.js: It looks like 'three.js' is not loaded. This script requires 'THREE' object to " +
            "be defined. See https://github.com/xyzmaps/harp.gl/@xyzmaps/harp.gl."
    );
}

export * from "@xyzmaps/harp-mapview";
export * from "@xyzmaps/harp-vectortile-datasource";
export * from "@xyzmaps/harp-omv-datasource";
export * from "@xyzmaps/harp-debug-datasource";
export * from "@xyzmaps/harp-geojson-datasource";
export * from "@xyzmaps/harp-features-datasource";
export * from "@xyzmaps/harp-webtile-datasource";
export * from "@xyzmaps/harp-map-controls/lib/MapControls";
export * from "@xyzmaps/harp-map-controls/lib/MapControlsUI";
export * from "@xyzmaps/harp-datasource-protocol";
export * from "@xyzmaps/harp-geoutils";
export * from "@xyzmaps/harp-mapview-decoder";

mapBundleMain();
