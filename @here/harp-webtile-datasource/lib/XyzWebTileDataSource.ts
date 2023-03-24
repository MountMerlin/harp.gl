/*
 * Copyright (C) 2019-2021 Raster Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { CopyrightInfo, TextureLoader, Tile } from "@here/harp-mapview";

import { Texture } from "three";

import {
    WebTileDataProvider,
    WebTileDataSource,
    WebTileDataSourceOptions
} from "./WebTileDataSource";

const textureLoader = new TextureLoader();

/**
 * Options for {@link RasterWebTileDataSource}.
 */
interface RasterWebTileDataSourceOptions extends Omit<WebTileDataSourceOptions, "dataProvider"> {
    tileBaseAddress?: string;

    tileSet?: string;
}

/**
 * An interface for the type of options that can be passed to the [[WebTileDataSource]].
 */
export type RasterWebTileDataSourceParameters = RasterWebTileDataSourceOptions;

export class RasterTileProvider implements WebTileDataProvider {
    /** Predefined fixed Raster copyright info. */
    // private readonly COPYRIGHT_INFO: CopyrightInfo = {
    //     id: "Raster.com",
    //     year: new Date().getFullYear(),
    //     label: "Raster",
    //     link: "https://legal.Raster.com/terms"
    // };

    constructor(private readonly m_options: RasterWebTileDataSourceParameters) {}

    /** @override */
    async getTexture(tile: Tile, abortSignal?: AbortSignal): Promise<[Texture, CopyrightInfo[]]> {
        const level = tile.tileKey.level;
        const column = tile.tileKey.column;
        const row = tile.tileKey.row;
        const quadKey = tile.tileKey.toQuadKey();
        const server = parseInt(quadKey[quadKey.length - 1], 10) + 1;

        let tileSet = this.m_options.tileSet ?? "naturalearth";
        const url = `https://tiles.xyzmaps.org/${tileSet}/${level}/${column}/${row}.png`;
        // const url = `http://localhost:3000/${level}/${column}/${row}.png`;

        return [await textureLoader.load(url, undefined, abortSignal), []];
    }
}

/**
 * Instances of `RasterWebTileDataSource` can be used to add Web Tile to [[MapView]].
 *
 * Example:
 *
 * ```typescript
 * const RasterWebTileDataSource = new RasterWebTileDataSource({
 *     authenticationCode: <authenticationCode>
 * });
 * ```
 * @see [[DataSource]], [[OmvDataSource]].
 */
export class RasterWebTileDataSource extends WebTileDataSource {
    /**
     * Constructs a new `RasterWebTileDataSource`.
     *
     * @param m_options - Represents the [[RasterWebTileDataSourceParameters]].
     */
    constructor(m_options: RasterWebTileDataSourceParameters) {
        super({
            ...m_options,
            minDataLevel: 1,
            maxDataLevel: 7,
            resolution: m_options.resolution,
            dataProvider: new RasterTileProvider(m_options),
            storageLevelOffset: m_options.storageLevelOffset ?? -1
        });
        this.cacheable = true;
    }
}
