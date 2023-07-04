/*
 * Copyright (C) 2023-     XYZ maps contributors
 * Copyright (C) 2020-2021 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-console */

import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const reportFolder = path.resolve("input");
    const reportTempFolder = path.resolve("temp");

    fs.mkdirSync(reportFolder, {
        recursive: true
    });

    fs.mkdirSync(reportTempFolder, {
        recursive: true
    });

    const workspaces = JSON.parse(execSync("yarn workspaces --silent info").toString());

    const skipPackages: string[] = [
        "@xyzmaps/create-harp.gl-app",
        "@xyzmaps/generator-harp.gl",
        "@xyzmaps/harp-atlas-tools",
        "@xyzmaps/harp-test-utils",
        "@xyzmaps/harp-theme-tools",
        "@xyzmaps/harp-webpack-utils",
        "@xyzmaps/harp.gl",
        "@xyzmaps/harp-website",
        "@xyzmaps/harp-performance-tests",
        "@xyzmaps/harp-rendering-test",
        "@xyzmaps/harp-examples",

        "@xyzmaps/harp-lines",
        "@xyzmaps/harp-map-theme"
    ];

    const packages = Object.keys(workspaces).filter(p => !skipPackages.includes(p));

    packages.forEach(packageName => {
        const packageJson = require(`${packageName}/package.json`) as any;

        console.log(`-- yarn build ${packageName}`);
        console.log(
            execSync("yarn build", {
                cwd: path.resolve(`${packageName}`)
            }).toString()
        );

        const config = ExtractorConfig.prepare({
            packageJson,
            packageJsonFullPath: path.resolve(`${packageName}/package.json`),
            configObjectFullPath: path.resolve(`${packageName}`),
            configObject: {
                projectFolder: path.resolve(packageName),
                mainEntryPointFilePath: path.resolve(`${packageName}/index.d.ts`),
                compiler: {
                    tsconfigFilePath: path.resolve(`${packageName}/tsconfig.json`)
                },
                docModel: {
                    enabled: true,
                    apiJsonFilePath: `${reportFolder}/<unscopedPackageName>.api.json`
                },
                apiReport: {
                    enabled: true,
                    reportFolder,
                    reportTempFolder,
                    reportFileName: "<unscopedPackageName>.api.md"
                }
            }
        });

        const result = Extractor.invoke(config, {
            localBuild: true,
            messageCallback: message => {
                let loc = "";
                if (message.sourceFilePath !== undefined) {
                    loc += `${message.sourceFilePath}:`;
                    if (message.sourceFileLine !== undefined) {
                        loc += `${message.sourceFileLine}:`;
                        if (message.sourceFileColumn !== undefined) {
                            loc += `${message.sourceFileColumn}:`;
                        }
                    }
                    loc += " ";
                }
                console.warn(`${loc}(${message.category}) ${message.text} (${message.messageId})`);
            }
        });
        if (!result.succeeded) {
            throw new Error(`failed to extract api when processing '${packageName}'`);
        }
    });

    console.log(execSync("yarn exec api-documenter markdown").toString());
}

main();
