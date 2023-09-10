"use strict";
(() => {
var exports = {};
exports.id = 442;
exports.ids = [442];
exports.modules = {

/***/ 730:
/***/ ((module) => {

module.exports = require("next/dist/server/api-utils/node.js");

/***/ }),

/***/ 3076:
/***/ ((module) => {

module.exports = require("next/dist/server/future/route-modules/route-module.js");

/***/ }),

/***/ 7147:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 1017:
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ 7065:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  config: () => (/* binding */ config),
  "default": () => (/* binding */ next_route_loaderkind_PAGES_API_page_2Fapi_2Fmatches_preferredRegion_absolutePagePath_private_next_pages_2Fapi_2Fmatches_tsx_middlewareConfigBase64_e30_3D_),
  routeModule: () => (/* binding */ routeModule)
});

// NAMESPACE OBJECT: ./pages/api/matches.tsx
var matches_namespaceObject = {};
__webpack_require__.r(matches_namespaceObject);
__webpack_require__.d(matches_namespaceObject, {
  "default": () => (handler)
});

// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-modules/pages-api/module.js
var pages_api_module = __webpack_require__(6429);
// EXTERNAL MODULE: ./node_modules/next/dist/server/future/route-kind.js
var route_kind = __webpack_require__(7153);
// EXTERNAL MODULE: ./node_modules/next/dist/build/webpack/loaders/next-route-loader/helpers.js
var helpers = __webpack_require__(7305);
// EXTERNAL MODULE: external "path"
var external_path_ = __webpack_require__(1017);
var external_path_default = /*#__PURE__*/__webpack_require__.n(external_path_);
// EXTERNAL MODULE: external "fs"
var external_fs_ = __webpack_require__(7147);
;// CONCATENATED MODULE: ./pages/api/matches.tsx


async function handler(req, res) {
    //Find the absolute path of the json directory
    const jsonDirectory = external_path_default().join(process.cwd(), "data");
    //Read the json data file data.json
    const fileContents = await external_fs_.promises.readFile(jsonDirectory + "/matches.json", "utf8");
    const matches = JSON.parse(fileContents).filter((e)=>e.id);
    //Return the content of the data file in json format
    res.status(200).json(matches);
}

;// CONCATENATED MODULE: ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fmatches&preferredRegion=&absolutePagePath=private-next-pages%2Fapi%2Fmatches.tsx&middlewareConfigBase64=e30%3D!
// @ts-ignore this need to be imported from next/dist to be external



const PagesAPIRouteModule = pages_api_module.PagesAPIRouteModule;
// Import the userland code.
// @ts-expect-error - replaced by webpack/turbopack loader

// Re-export the handler (should be the default export).
/* harmony default export */ const next_route_loaderkind_PAGES_API_page_2Fapi_2Fmatches_preferredRegion_absolutePagePath_private_next_pages_2Fapi_2Fmatches_tsx_middlewareConfigBase64_e30_3D_ = ((0,helpers/* hoist */.l)(matches_namespaceObject, "default"));
// Re-export config.
const config = (0,helpers/* hoist */.l)(matches_namespaceObject, "config");
// Create and export the route module that will be consumed.
const routeModule = new PagesAPIRouteModule({
    definition: {
        kind: route_kind/* RouteKind */.x.PAGES_API,
        page: "/api/matches",
        pathname: "/api/matches",
        // The following aren't used in production.
        bundlePath: "",
        filename: ""
    },
    userland: matches_namespaceObject
});

//# sourceMappingURL=pages-api.js.map

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [172], () => (__webpack_exec__(7065)));
module.exports = __webpack_exports__;

})();