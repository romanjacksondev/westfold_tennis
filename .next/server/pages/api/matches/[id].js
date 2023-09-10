"use strict";
(() => {
var exports = {};
exports.id = 987;
exports.ids = [987];
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

/***/ 4613:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  config: () => (/* binding */ config),
  "default": () => (/* binding */ next_route_loaderkind_PAGES_API_page_2Fapi_2Fmatches_2F_5Bid_5D_preferredRegion_absolutePagePath_private_next_pages_2Fapi_2Fmatches_2F_5Bid_5D_tsx_middlewareConfigBase64_e30_3D_),
  routeModule: () => (/* binding */ routeModule)
});

// NAMESPACE OBJECT: ./pages/api/matches/[id].tsx
var _id_namespaceObject = {};
__webpack_require__.r(_id_namespaceObject);
__webpack_require__.d(_id_namespaceObject, {
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
;// CONCATENATED MODULE: ./pages/api/matches/[id].tsx


async function handler(req, res) {
    const { id } = req.query;
    const jsonDirectory = external_path_default().join(process.cwd(), "data");
    //busco los torneos y filtro por id
    //Read the json data file data.json
    let fileContents = await external_fs_.promises.readFile(jsonDirectory + "/tournaments.json", "utf8");
    const tournaments = JSON.parse(fileContents);
    const tournament = tournaments.tournaments.find((e)=>e.id === id);
    //Read the json data file data.json
    fileContents = await external_fs_.promises.readFile(jsonDirectory + "/matches.json", "utf8");
    const matches = JSON.parse(fileContents);
    const filteredMatches = matches.matches.filter((e)=>tournament.matches.includes(e.id));
    //Read the json data file data.json
    fileContents = await external_fs_.promises.readFile(jsonDirectory + "/players.json", "utf8");
    const players = JSON.parse(fileContents);
    const response = {
        players: players,
        matches: filteredMatches,
        tournamentName: tournament.name
    };
    //Return the content of the data file in json format
    res.status(200).json(response);
}

;// CONCATENATED MODULE: ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fmatches%2F%5Bid%5D&preferredRegion=&absolutePagePath=private-next-pages%2Fapi%2Fmatches%2F%5Bid%5D.tsx&middlewareConfigBase64=e30%3D!
// @ts-ignore this need to be imported from next/dist to be external



const PagesAPIRouteModule = pages_api_module.PagesAPIRouteModule;
// Import the userland code.
// @ts-expect-error - replaced by webpack/turbopack loader

// Re-export the handler (should be the default export).
/* harmony default export */ const next_route_loaderkind_PAGES_API_page_2Fapi_2Fmatches_2F_5Bid_5D_preferredRegion_absolutePagePath_private_next_pages_2Fapi_2Fmatches_2F_5Bid_5D_tsx_middlewareConfigBase64_e30_3D_ = ((0,helpers/* hoist */.l)(_id_namespaceObject, "default"));
// Re-export config.
const config = (0,helpers/* hoist */.l)(_id_namespaceObject, "config");
// Create and export the route module that will be consumed.
const routeModule = new PagesAPIRouteModule({
    definition: {
        kind: route_kind/* RouteKind */.x.PAGES_API,
        page: "/api/matches/[id]",
        pathname: "/api/matches/[id]",
        // The following aren't used in production.
        bundlePath: "",
        filename: ""
    },
    userland: _id_namespaceObject
});

//# sourceMappingURL=pages-api.js.map

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [172], () => (__webpack_exec__(4613)));
module.exports = __webpack_exports__;

})();