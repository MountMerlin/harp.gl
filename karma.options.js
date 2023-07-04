/*
 * Copyright (C) 2023-     XYZ maps contributors
 * Copyright (C) 2017-2020 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

//@ts-check

const path = require("path");

/**
 * @type {import("karma").ConfigOptions}
 */
const options = function (isCoverage, isMapSdk, prefixDirectory) {
    const reports = isCoverage
        ? {
              "text-summary": "",
              // Needed for codecov.io, includes html as well
              lcov: "coverage"
          }
        : {};

    // Fixes the prefix to search for files, required for running the tests from sdk
    const fixPrefix = function (file) {
        const appendPrefix = file => {
            if (file.startsWith("**") || file.startsWith("node_modules")) {
                return file;
            } else {
                return path.join(prefixDirectory, file);
            }
        };
        if (typeof file === "string") {
            return appendPrefix(file);
        } else {
            return {
                ...{ pattern: appendPrefix(file.pattern) },
                // Conditionally add this if not undefined.
                ...(file.included !== undefined && { included: file.included })
            };
        }
    };

    return {
        browsers: [
            'ChromeDebug'
        ],
        customLaunchers: {
            ChromeDebug: {
                base: 'Chrome',
                flags: ['--no-sandbox', '--remote-debugging-port=9333', 'http://localhost:9876/debug.html']
            }
        },
        frameworks: ["mocha", "karma-typescript"],

        // web server port
        port: 9876,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        // List of files / patterns to load in the browser these files minus the ones specified
        // in the `exclude` property and where `included` isn't false. This dictates the code we
        // are to check its coverage. Note, the tests themselves don't count to code coverage and
        // are excluded using the karmaTypescriptConfig.coverage.exclude property.
        files: [
            "@xyzmaps/harp-datasource-protocol/**/*.ts",
            "@xyzmaps/harp-debug-datasource/**/*.ts",
            "@xyzmaps/harp-geometry/**/*.ts",
            "@xyzmaps/harp-fetch/**/*.ts",
            "@xyzmaps/harp-utils/**/*.ts",
            "@xyzmaps/harp-geoutils/**/*.ts",
            "@xyzmaps/harp-mapview/**/*.ts",
            "@xyzmaps/harp-mapview-decoder/**/*.ts",
            "@xyzmaps/harp-materials/**/*.ts",
            "@xyzmaps/harp-text-canvas/**/*.ts",
            "@xyzmaps/harp-lrucache/**/*.ts",
            "@xyzmaps/harp-transfer-manager/**/*.ts",
            "@xyzmaps/harp-lines/**/*.ts",
            "@xyzmaps/harp-test-utils/**/*.ts",
            "@xyzmaps/harp-map-controls/**/*.ts",
            "@xyzmaps/harp-olp-utils/**/*.ts",
            "@xyzmaps/harp-webtile-datasource/**/*.ts",
            // Resources here are fetched by URL, note these require the correct proxy to be setup
            // see "proxies" below.
            {
                pattern: "@xyzmaps/harp-test-utils/test/resources/*.*",
                included: false
            },
            // This is needed to access the font resources when running the repo separate from the
            // sdk.
            {
                pattern: "node_modules/@xyzmaps/harp-fontcatalog/resources/**/*.*",
                included: false
            },
            // This is needed when this repo is managed with the repo tool
            {
                pattern: "@xyzmaps/harp-text-canvas/resources/fonts/**/*.*",
                included: false
            },
            {
                pattern: "@xyzmaps/harp-mapview/test/resources/*.*",
                included: false
            },
            {
                pattern: "@xyzmaps/harp-datasource-protocol/theme.schema.json",
                included: false
            },
            "@xyzmaps/harp-vectortile-datasource/lib/adapters/omv/proto/vector_tile.js",
            "@xyzmaps/harp-vectortile-datasource/**/*.ts",
            "@xyzmaps/harp-map-theme/test/DefaultThemeTest.ts",
            // These files are needed for the test above.
            {
                pattern: "@xyzmaps/harp-map-theme/resources/*.json",
                included: false
            }
        ].map(file => fixPrefix(file)),

        // Files that are to be excluded from the list included above.
        exclude: [
            "**/test/rendering/**/*.*",
            "@xyzmaps/harp-test-utils/lib/rendering/RenderingTestResultServer.ts",
            "@xyzmaps/harp-test-utils/lib/rendering/RenderingTestResultCli.ts",
            "@xyzmaps/harp-datasource-protocol/test/ThemeTypingsTest.ts",
            "**/*.d.ts"
        ].map(file => fixPrefix(file)),

        // source files, that you wanna generate coverage for
        // do not include tests or libraries
        // (these files will be instrumented by Istanbul)
        preprocessors: {
            "@xyzmaps/harp-vectortile-datasource/lib/adapters/omv/proto/vector_tile.js": [
                "karma-typescript"
            ],
            "@xyzmaps/**/*.ts": ["karma-typescript"]
        },

        // We use coverage-istanbul instead of karma-typescript because it can output json format
        // which provides numbers similar to the previous report and not very conservative numbers.
        reporters: ["progress", "coverage-istanbul"],

        coverageIstanbulReporter: {
            // reports can be any that are listed here: https://github.com/istanbuljs/istanbuljs/tree/73c25ce79f91010d1ff073aa6ff3fd01114f90db/packages/istanbul-reports/lib
            reports: ["html", "text-summary", "json"],

            dir: path.join(__dirname, "coverage"),

            "report-config": {
                html: {
                    // outputs the report in ./coverage/html
                    subdir: "html"
                }
            }
        },

        proxies: {
            // How to access the local resources, normally this would handled by webpack, but we need to
            // bundle the tests with karma-typescript, so we have to configure where the resources are,
            // by default the resources relative to the root base folder.
            "/@xyzmaps": "/base/@xyzmaps",
            "/@xyzmaps/harp-fontcatalog/resources/": isMapSdk
                ? "/base/@xyzmaps/harp-text-canvas/resources/fonts/"
                : "/base/node_modules/@xyzmaps/harp-fontcatalog/resources/"
        },
        karmaTypescriptConfig: {
            tsconfig: "./tsconfig.json",

            // Don't try to compile the referenced
            compilerOptions: {
                skipLibCheck: true,
                // This is needed because there is a Typescript file which references vector_tile.js
                allowJs: true
            },
            coverageOptions: {
                instrumentation: isCoverage ? true : false,
                // This is needed otherwise the tests are included in the code coverage %.
                exclude: [
                    /test\/+/,
                    /vector_tile\.js/,
                    /\.node\.ts/,
                    /index.*\.ts/,
                    /\.tsx/,
                    /coresdk\/@xyzmaps\/harp-test-utils\/lib\/rendering/
                ]
            },
            reports,
            // "allowJs" tries to compile all sorts of stuff, so we need to restrict it.
            exclude: ["**/webpack.*.js", "**/karma.*js"]
        }
    };
};
module.exports = { options };
