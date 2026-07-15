"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/admin/analytics/route";
exports.ids = ["app/api/admin/analytics/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fanalytics%2Froute&page=%2Fapi%2Fadmin%2Fanalytics%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fanalytics%2Froute.ts&appDir=D%3A%5CnextJSApps%5CnetaiLogistics%5Cnextjs_space%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CnextJSApps%5CnetaiLogistics%5Cnextjs_space&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fanalytics%2Froute&page=%2Fapi%2Fadmin%2Fanalytics%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fanalytics%2Froute.ts&appDir=D%3A%5CnextJSApps%5CnetaiLogistics%5Cnextjs_space%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CnextJSApps%5CnetaiLogistics%5Cnextjs_space&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_nextJSApps_netaiLogistics_nextjs_space_app_api_admin_analytics_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/admin/analytics/route.ts */ \"(rsc)/./app/api/admin/analytics/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/admin/analytics/route\",\n        pathname: \"/api/admin/analytics\",\n        filename: \"route\",\n        bundlePath: \"app/api/admin/analytics/route\"\n    },\n    resolvedPagePath: \"D:\\\\nextJSApps\\\\netaiLogistics\\\\nextjs_space\\\\app\\\\api\\\\admin\\\\analytics\\\\route.ts\",\n    nextConfigOutput,\n    userland: D_nextJSApps_netaiLogistics_nextjs_space_app_api_admin_analytics_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/admin/analytics/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhZG1pbiUyRmFuYWx5dGljcyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGYWRtaW4lMkZhbmFseXRpY3MlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZhZG1pbiUyRmFuYWx5dGljcyUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDbmV4dEpTQXBwcyU1Q25ldGFpTG9naXN0aWNzJTVDbmV4dGpzX3NwYWNlJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1EJTNBJTVDbmV4dEpTQXBwcyU1Q25ldGFpTG9naXN0aWNzJTVDbmV4dGpzX3NwYWNlJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNrQztBQUMvRztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL2FwcC8/Y2ZmMCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJEOlxcXFxuZXh0SlNBcHBzXFxcXG5ldGFpTG9naXN0aWNzXFxcXG5leHRqc19zcGFjZVxcXFxhcHBcXFxcYXBpXFxcXGFkbWluXFxcXGFuYWx5dGljc1xcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYWRtaW4vYW5hbHl0aWNzL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYWRtaW4vYW5hbHl0aWNzXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hZG1pbi9hbmFseXRpY3Mvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJEOlxcXFxuZXh0SlNBcHBzXFxcXG5ldGFpTG9naXN0aWNzXFxcXG5leHRqc19zcGFjZVxcXFxhcHBcXFxcYXBpXFxcXGFkbWluXFxcXGFuYWx5dGljc1xcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYWRtaW4vYW5hbHl0aWNzL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fanalytics%2Froute&page=%2Fapi%2Fadmin%2Fanalytics%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fanalytics%2Froute.ts&appDir=D%3A%5CnextJSApps%5CnetaiLogistics%5Cnextjs_space%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CnextJSApps%5CnetaiLogistics%5Cnextjs_space&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/admin/analytics/route.ts":
/*!******************************************!*\
  !*** ./app/api/admin/analytics/route.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   dynamic: () => (/* binding */ dynamic)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/db */ \"(rsc)/./lib/db.ts\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _lib_auth_options__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/auth-options */ \"(rsc)/./lib/auth-options.ts\");\nconst dynamic = \"force-dynamic\";\n\n\n\n\nasync function isAdminOrManager() {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_2__.getServerSession)(_lib_auth_options__WEBPACK_IMPORTED_MODULE_3__.authOptions);\n    const role = session?.user?.role;\n    return role === \"admin\" || role === \"manager\";\n}\nasync function GET() {\n    try {\n        if (!await isAdminOrManager()) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Unauthorized\"\n        }, {\n            status: 401\n        });\n        const [orders, products, customers] = await Promise.all([\n            _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.order.findMany({\n                select: {\n                    total: true,\n                    discount: true,\n                    status: true,\n                    createdAt: true,\n                    items: {\n                        select: {\n                            quantity: true,\n                            productName: true,\n                            price: true\n                        }\n                    }\n                },\n                orderBy: {\n                    createdAt: \"asc\"\n                }\n            }),\n            _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.product.findMany({\n                select: {\n                    id: true,\n                    name: true,\n                    stockQuantity: true,\n                    lowStockThreshold: true,\n                    price: true,\n                    active: true,\n                    category: {\n                        select: {\n                            name: true\n                        }\n                    }\n                }\n            }),\n            _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.user.count({\n                where: {\n                    role: \"customer\"\n                }\n            })\n        ]);\n        // Revenue by month (last 6 months)\n        const now = new Date();\n        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);\n        const revenueByMonth = [];\n        for(let i = 5; i >= 0; i--){\n            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);\n            const monthLabel = d.toLocaleString(\"en-US\", {\n                month: \"short\",\n                year: \"2-digit\"\n            });\n            const monthOrders = orders.filter((o)=>{\n                const od = new Date(o.createdAt);\n                return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();\n            });\n            revenueByMonth.push({\n                month: monthLabel,\n                revenue: monthOrders.reduce((s, o)=>s + o.total, 0),\n                orders: monthOrders.length\n            });\n        }\n        // Top selling products\n        const productSales = {};\n        orders.forEach((o)=>{\n            o.items.forEach((item)=>{\n                if (!productSales[item.productName]) productSales[item.productName] = {\n                    name: item.productName,\n                    quantity: 0,\n                    revenue: 0\n                };\n                productSales[item.productName].quantity += item.quantity;\n                productSales[item.productName].revenue += item.price * item.quantity;\n            });\n        });\n        const topProducts = Object.values(productSales).sort((a, b)=>b.revenue - a.revenue).slice(0, 5);\n        // Order status breakdown\n        const statusCounts = {};\n        orders.forEach((o)=>{\n            statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;\n        });\n        // Low stock products\n        const lowStock = products.filter((p)=>p.active && p.stockQuantity <= p.lowStockThreshold).map((p)=>({\n                id: p.id,\n                name: p.name,\n                stockQuantity: p.stockQuantity,\n                lowStockThreshold: p.lowStockThreshold,\n                category: p.category.name\n            }));\n        // Summary\n        const totalRevenue = orders.reduce((s, o)=>s + o.total, 0);\n        const totalOrders = orders.length;\n        const totalDiscount = orders.reduce((s, o)=>s + (o.discount ?? 0), 0);\n        const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            summary: {\n                totalRevenue,\n                totalOrders,\n                totalCustomers: customers,\n                totalProducts: products.length,\n                totalDiscount,\n                avgOrderValue\n            },\n            revenueByMonth,\n            topProducts,\n            statusCounts,\n            lowStock\n        });\n    } catch (error) {\n        console.error(error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Failed to load analytics\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFFOUIsUUFBUSxJQUFJLElBQUk7UUFDckUsTUFBTXNELGdCQUFnQkYsY0FBYyxJQUFJRyxLQUFLQyxLQUFLLENBQUNMLGVBQWVDLGVBQWU7UUFFakYsT0FBT3pFLHFEQUFZQSxDQUFDUyxJQUFJLENBQUM7WUFDdkJxRSxTQUFTO2dCQUFFTjtnQkFBY0M7Z0JBQWFNLGdCQUFnQmpFO2dCQUFXa0UsZUFBZW5FLFNBQVM0QyxNQUFNO2dCQUFFaUI7Z0JBQWVDO1lBQWM7WUFDOUhqQztZQUNBbUI7WUFDQU87WUFDQUM7UUFDRjtJQUNGLEVBQUUsT0FBTzNELE9BQU87UUFDZHVFLFFBQVF2RSxLQUFLLENBQUNBO1FBQ2QsT0FBT1YscURBQVlBLENBQUNTLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQTJCLEdBQUc7WUFBRUMsUUFBUTtRQUFJO0lBQ2hGO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hcHAvLi9hcHAvYXBpL2FkbWluL2FuYWx5dGljcy9yb3V0ZS50cz9mMzExIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBkeW5hbWljID0gXCJmb3JjZS1keW5hbWljXCI7XG5pbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gXCJAL2xpYi9kYlwiO1xuaW1wb3J0IHsgZ2V0U2VydmVyU2Vzc2lvbiB9IGZyb20gXCJuZXh0LWF1dGhcIjtcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSBcIkAvbGliL2F1dGgtb3B0aW9uc1wiO1xuXG5hc3luYyBmdW5jdGlvbiBpc0FkbWluT3JNYW5hZ2VyKCkge1xuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucyk7XG4gIGNvbnN0IHJvbGUgPSAoc2Vzc2lvbj8udXNlciBhcyBhbnkpPy5yb2xlO1xuICByZXR1cm4gcm9sZSA9PT0gXCJhZG1pblwiIHx8IHJvbGUgPT09IFwibWFuYWdlclwiO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xuICB0cnkge1xuICAgIGlmICghKGF3YWl0IGlzQWRtaW5Pck1hbmFnZXIoKSkpIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBcIlVuYXV0aG9yaXplZFwiIH0sIHsgc3RhdHVzOiA0MDEgfSk7XG5cbiAgICBjb25zdCBbb3JkZXJzLCBwcm9kdWN0cywgY3VzdG9tZXJzXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIHByaXNtYS5vcmRlci5maW5kTWFueSh7IHNlbGVjdDogeyB0b3RhbDogdHJ1ZSwgZGlzY291bnQ6IHRydWUsIHN0YXR1czogdHJ1ZSwgY3JlYXRlZEF0OiB0cnVlLCBpdGVtczogeyBzZWxlY3Q6IHsgcXVhbnRpdHk6IHRydWUsIHByb2R1Y3ROYW1lOiB0cnVlLCBwcmljZTogdHJ1ZSB9IH0gfSwgb3JkZXJCeTogeyBjcmVhdGVkQXQ6IFwiYXNjXCIgfSB9KSxcbiAgICAgIHByaXNtYS5wcm9kdWN0LmZpbmRNYW55KHsgc2VsZWN0OiB7IGlkOiB0cnVlLCBuYW1lOiB0cnVlLCBzdG9ja1F1YW50aXR5OiB0cnVlLCBsb3dTdG9ja1RocmVzaG9sZDogdHJ1ZSwgcHJpY2U6IHRydWUsIGFjdGl2ZTogdHJ1ZSwgY2F0ZWdvcnk6IHsgc2VsZWN0OiB7IG5hbWU6IHRydWUgfSB9IH0gfSksXG4gICAgICBwcmlzbWEudXNlci5jb3VudCh7IHdoZXJlOiB7IHJvbGU6IFwiY3VzdG9tZXJcIiB9IH0pLFxuICAgIF0pO1xuXG4gICAgLy8gUmV2ZW51ZSBieSBtb250aCAobGFzdCA2IG1vbnRocylcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgIGNvbnN0IHNpeE1vbnRoc0FnbyA9IG5ldyBEYXRlKG5vdy5nZXRGdWxsWWVhcigpLCBub3cuZ2V0TW9udGgoKSAtIDUsIDEpO1xuICAgIGNvbnN0IHJldmVudWVCeU1vbnRoOiB7IG1vbnRoOiBzdHJpbmc7IHJldmVudWU6IG51bWJlcjsgb3JkZXJzOiBudW1iZXIgfVtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDU7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBkID0gbmV3IERhdGUobm93LmdldEZ1bGxZZWFyKCksIG5vdy5nZXRNb250aCgpIC0gaSwgMSk7XG4gICAgICBjb25zdCBtb250aExhYmVsID0gZC50b0xvY2FsZVN0cmluZyhcImVuLVVTXCIsIHsgbW9udGg6IFwic2hvcnRcIiwgeWVhcjogXCIyLWRpZ2l0XCIgfSk7XG4gICAgICBjb25zdCBtb250aE9yZGVycyA9IG9yZGVycy5maWx0ZXIoKG8pID0+IHtcbiAgICAgICAgY29uc3Qgb2QgPSBuZXcgRGF0ZShvLmNyZWF0ZWRBdCk7XG4gICAgICAgIHJldHVybiBvZC5nZXRNb250aCgpID09PSBkLmdldE1vbnRoKCkgJiYgb2QuZ2V0RnVsbFllYXIoKSA9PT0gZC5nZXRGdWxsWWVhcigpO1xuICAgICAgfSk7XG4gICAgICByZXZlbnVlQnlNb250aC5wdXNoKHsgbW9udGg6IG1vbnRoTGFiZWwsIHJldmVudWU6IG1vbnRoT3JkZXJzLnJlZHVjZSgocywgbykgPT4gcyArIG8udG90YWwsIDApLCBvcmRlcnM6IG1vbnRoT3JkZXJzLmxlbmd0aCB9KTtcbiAgICB9XG5cbiAgICAvLyBUb3Agc2VsbGluZyBwcm9kdWN0c1xuICAgIGNvbnN0IHByb2R1Y3RTYWxlczogUmVjb3JkPHN0cmluZywgeyBuYW1lOiBzdHJpbmc7IHF1YW50aXR5OiBudW1iZXI7IHJldmVudWU6IG51bWJlciB9PiA9IHt9O1xuICAgIG9yZGVycy5mb3JFYWNoKChvKSA9PiB7XG4gICAgICBvLml0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaWYgKCFwcm9kdWN0U2FsZXNbaXRlbS5wcm9kdWN0TmFtZV0pIHByb2R1Y3RTYWxlc1tpdGVtLnByb2R1Y3ROYW1lXSA9IHsgbmFtZTogaXRlbS5wcm9kdWN0TmFtZSwgcXVhbnRpdHk6IDAsIHJldmVudWU6IDAgfTtcbiAgICAgICAgcHJvZHVjdFNhbGVzW2l0ZW0ucHJvZHVjdE5hbWVdLnF1YW50aXR5ICs9IGl0ZW0ucXVhbnRpdHk7XG4gICAgICAgIHByb2R1Y3RTYWxlc1tpdGVtLnByb2R1Y3ROYW1lXS5yZXZlbnVlICs9IGl0ZW0ucHJpY2UgKiBpdGVtLnF1YW50aXR5O1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29uc3QgdG9wUHJvZHVjdHMgPSBPYmplY3QudmFsdWVzKHByb2R1Y3RTYWxlcykuc29ydCgoYSwgYikgPT4gYi5yZXZlbnVlIC0gYS5yZXZlbnVlKS5zbGljZSgwLCA1KTtcblxuICAgIC8vIE9yZGVyIHN0YXR1cyBicmVha2Rvd25cbiAgICBjb25zdCBzdGF0dXNDb3VudHM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcbiAgICBvcmRlcnMuZm9yRWFjaCgobykgPT4geyBzdGF0dXNDb3VudHNbby5zdGF0dXNdID0gKHN0YXR1c0NvdW50c1tvLnN0YXR1c10gPz8gMCkgKyAxOyB9KTtcblxuICAgIC8vIExvdyBzdG9jayBwcm9kdWN0c1xuICAgIGNvbnN0IGxvd1N0b2NrID0gcHJvZHVjdHMuZmlsdGVyKChwKSA9PiBwLmFjdGl2ZSAmJiBwLnN0b2NrUXVhbnRpdHkgPD0gcC5sb3dTdG9ja1RocmVzaG9sZCkubWFwKChwKSA9PiAoe1xuICAgICAgaWQ6IHAuaWQsIG5hbWU6IHAubmFtZSwgc3RvY2tRdWFudGl0eTogcC5zdG9ja1F1YW50aXR5LCBsb3dTdG9ja1RocmVzaG9sZDogcC5sb3dTdG9ja1RocmVzaG9sZCwgY2F0ZWdvcnk6IHAuY2F0ZWdvcnkubmFtZSxcbiAgICB9KSk7XG5cbiAgICAvLyBTdW1tYXJ5XG4gICAgY29uc3QgdG90YWxSZXZlbnVlID0gb3JkZXJzLnJlZHVjZSgocywgbykgPT4gcyArIG8udG90YWwsIDApO1xuICAgIGNvbnN0IHRvdGFsT3JkZXJzID0gb3JkZXJzLmxlbmd0aDtcbiAgICBjb25zdCB0b3RhbERpc2NvdW50ID0gb3JkZXJzLnJlZHVjZSgocywgbykgPT4gcyArIChvLmRpc2NvdW50ID8/IDApLCAwKTtcbiAgICBjb25zdCBhdmdPcmRlclZhbHVlID0gdG90YWxPcmRlcnMgPiAwID8gTWF0aC5yb3VuZCh0b3RhbFJldmVudWUgLyB0b3RhbE9yZGVycykgOiAwO1xuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIHN1bW1hcnk6IHsgdG90YWxSZXZlbnVlLCB0b3RhbE9yZGVycywgdG90YWxDdXN0b21lcnM6IGN1c3RvbWVycywgdG90YWxQcm9kdWN0czogcHJvZHVjdHMubGVuZ3RoLCB0b3RhbERpc2NvdW50LCBhdmdPcmRlclZhbHVlIH0sXG4gICAgICByZXZlbnVlQnlNb250aCxcbiAgICAgIHRvcFByb2R1Y3RzLFxuICAgICAgc3RhdHVzQ291bnRzLFxuICAgICAgbG93U3RvY2ssXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGxvYWQgYW5hbHl0aWNzXCIgfSwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbImR5bmFtaWMiLCJOZXh0UmVzcG9uc2UiLCJwcmlzbWEiLCJnZXRTZXJ2ZXJTZXNzaW9uIiwiYXV0aE9wdGlvbnMiLCJpc0FkbWluT3JNYW5hZ2VyIiwic2Vzc2lvbiIsInJvbGUiLCJ1c2VyIiwiR0VUIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwib3JkZXJzIiwicHJvZHVjdHMiLCJjdXN0b21lcnMiLCJQcm9taXNlIiwiYWxsIiwib3JkZXIiLCJmaW5kTWFueSIsInNlbGVjdCIsInRvdGFsIiwiZGlzY291bnQiLCJjcmVhdGVkQXQiLCJpdGVtcyIsInF1YW50aXR5IiwicHJvZHVjdE5hbWUiLCJwcmljZSIsIm9yZGVyQnkiLCJwcm9kdWN0IiwiaWQiLCJuYW1lIiwic3RvY2tRdWFudGl0eSIsImxvd1N0b2NrVGhyZXNob2xkIiwiYWN0aXZlIiwiY2F0ZWdvcnkiLCJjb3VudCIsIndoZXJlIiwibm93IiwiRGF0ZSIsInNpeE1vbnRoc0FnbyIsImdldEZ1bGxZZWFyIiwiZ2V0TW9udGgiLCJyZXZlbnVlQnlNb250aCIsImkiLCJkIiwibW9udGhMYWJlbCIsInRvTG9jYWxlU3RyaW5nIiwibW9udGgiLCJ5ZWFyIiwibW9udGhPcmRlcnMiLCJmaWx0ZXIiLCJvIiwib2QiLCJwdXNoIiwicmV2ZW51ZSIsInJlZHVjZSIsInMiLCJsZW5ndGgiLCJwcm9kdWN0U2FsZXMiLCJmb3JFYWNoIiwiaXRlbSIsInRvcFByb2R1Y3RzIiwiT2JqZWN0IiwidmFsdWVzIiwic29ydCIsImEiLCJiIiwic2xpY2UiLCJzdGF0dXNDb3VudHMiLCJsb3dTdG9jayIsInAiLCJtYXAiLCJ0b3RhbFJldmVudWUiLCJ0b3RhbE9yZGVycyIsInRvdGFsRGlzY291bnQiLCJhdmdPcmRlclZhbHVlIiwiTWF0aCIsInJvdW5kIiwic3VtbWFyeSIsInRvdGFsQ3VzdG9tZXJzIiwidG90YWxQcm9kdWN0cyIsImNvbnNvbGUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/admin/analytics/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth-options.ts":
/*!*****************************!*\
  !*** ./lib/auth-options.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/db */ \"(rsc)/./lib/db.ts\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) return null;\n                try {\n                    const user = await _lib_db__WEBPACK_IMPORTED_MODULE_1__.prisma.user.findUnique({\n                        where: {\n                            email: credentials.email\n                        }\n                    });\n                    if (!user) return null;\n                    const isValid = await bcryptjs__WEBPACK_IMPORTED_MODULE_2___default().compare(credentials.password, user.passwordHash);\n                    if (!isValid) return null;\n                    if (user.isActive === false) return null;\n                    return {\n                        id: user.id,\n                        email: user.email,\n                        name: user.name,\n                        role: user.role\n                    };\n                } catch  {\n                    return null;\n                }\n            }\n        })\n    ],\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.role = user.role;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session?.user) {\n                session.user.id = token.id;\n                session.user.role = token.role;\n            }\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/login\"\n    },\n    session: {\n        strategy: \"jwt\"\n    },\n    secret: process.env.NEXTAUTH_SECRET\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC1vcHRpb25zLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQ2tFO0FBQ2hDO0FBQ0o7QUFFdkIsTUFBTUcsY0FBK0I7SUFDMUNDLFdBQVc7UUFDVEosMkVBQW1CQSxDQUFDO1lBQ2xCSyxNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07Z0JBQVE7Z0JBQ3ZDQyxVQUFVO29CQUFFRixPQUFPO29CQUFZQyxNQUFNO2dCQUFXO1lBQ2xEO1lBQ0EsTUFBTUUsV0FBVUwsV0FBVztnQkFDekIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELGFBQWFJLFVBQVUsT0FBTztnQkFDMUQsSUFBSTtvQkFDRixNQUFNRSxPQUFPLE1BQU1YLDJDQUFNQSxDQUFDVyxJQUFJLENBQUNDLFVBQVUsQ0FBQzt3QkFDeENDLE9BQU87NEJBQUVQLE9BQU9ELFlBQVlDLEtBQUs7d0JBQUM7b0JBQ3BDO29CQUNBLElBQUksQ0FBQ0ssTUFBTSxPQUFPO29CQUNsQixNQUFNRyxVQUFVLE1BQU1iLHVEQUFjLENBQUNJLFlBQVlJLFFBQVEsRUFBRUUsS0FBS0ssWUFBWTtvQkFDNUUsSUFBSSxDQUFDRixTQUFTLE9BQU87b0JBQ3JCLElBQUlILEtBQUtNLFFBQVEsS0FBSyxPQUFPLE9BQU87b0JBQ3BDLE9BQU87d0JBQ0xDLElBQUlQLEtBQUtPLEVBQUU7d0JBQ1haLE9BQU9LLEtBQUtMLEtBQUs7d0JBQ2pCRixNQUFNTyxLQUFLUCxJQUFJO3dCQUNmZSxNQUFNUixLQUFLUSxJQUFJO29CQUNqQjtnQkFDRixFQUFFLE9BQU07b0JBQ04sT0FBTztnQkFDVDtZQUNGO1FBQ0Y7S0FDRDtJQUNEQyxXQUFXO1FBQ1QsTUFBTUMsS0FBSSxFQUFFQyxLQUFLLEVBQUVYLElBQUksRUFBTztZQUM1QixJQUFJQSxNQUFNO2dCQUNSVyxNQUFNSixFQUFFLEdBQUdQLEtBQUtPLEVBQUU7Z0JBQ2xCSSxNQUFNSCxJQUFJLEdBQUdSLEtBQUtRLElBQUk7WUFDeEI7WUFDQSxPQUFPRztRQUNUO1FBQ0EsTUFBTUMsU0FBUSxFQUFFQSxPQUFPLEVBQUVELEtBQUssRUFBTztZQUNuQyxJQUFJQyxTQUFTWixNQUFNO2dCQUNoQlksUUFBUVosSUFBSSxDQUFTTyxFQUFFLEdBQUdJLE1BQU1KLEVBQUU7Z0JBQ2xDSyxRQUFRWixJQUFJLENBQVNRLElBQUksR0FBR0csTUFBTUgsSUFBSTtZQUN6QztZQUNBLE9BQU9JO1FBQ1Q7SUFDRjtJQUNBQyxPQUFPO1FBQ0xDLFFBQVE7SUFDVjtJQUNBRixTQUFTO1FBQ1BHLFVBQVU7SUFDWjtJQUNBQyxRQUFRQyxRQUFRQyxHQUFHLENBQUNDLGVBQWU7QUFDckMsRUFBRSIsInNvdXJjZXMiOlsid2VicGFjazovL2FwcC8uL2xpYi9hdXRoLW9wdGlvbnMudHM/YWE3MSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0QXV0aE9wdGlvbnMgfSBmcm9tIFwibmV4dC1hdXRoXCI7XG5pbXBvcnQgQ3JlZGVudGlhbHNQcm92aWRlciBmcm9tIFwibmV4dC1hdXRoL3Byb3ZpZGVycy9jcmVkZW50aWFsc1wiO1xuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSBcIkAvbGliL2RiXCI7XG5pbXBvcnQgYmNyeXB0IGZyb20gXCJiY3J5cHRqc1wiO1xuXG5leHBvcnQgY29uc3QgYXV0aE9wdGlvbnM6IE5leHRBdXRoT3B0aW9ucyA9IHtcbiAgcHJvdmlkZXJzOiBbXG4gICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XG4gICAgICBuYW1lOiBcImNyZWRlbnRpYWxzXCIsXG4gICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICBlbWFpbDogeyBsYWJlbDogXCJFbWFpbFwiLCB0eXBlOiBcImVtYWlsXCIgfSxcbiAgICAgICAgcGFzc3dvcmQ6IHsgbGFiZWw6IFwiUGFzc3dvcmRcIiwgdHlwZTogXCJwYXNzd29yZFwiIH0sXG4gICAgICB9LFxuICAgICAgYXN5bmMgYXV0aG9yaXplKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmICghY3JlZGVudGlhbHM/LmVtYWlsIHx8ICFjcmVkZW50aWFscz8ucGFzc3dvcmQpIHJldHVybiBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgICAgICAgIHdoZXJlOiB7IGVtYWlsOiBjcmVkZW50aWFscy5lbWFpbCB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICghdXNlcikgcmV0dXJuIG51bGw7XG4gICAgICAgICAgY29uc3QgaXNWYWxpZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKGNyZWRlbnRpYWxzLnBhc3N3b3JkLCB1c2VyLnBhc3N3b3JkSGFzaCk7XG4gICAgICAgICAgaWYgKCFpc1ZhbGlkKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICBpZiAodXNlci5pc0FjdGl2ZSA9PT0gZmFsc2UpIHJldHVybiBudWxsO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgICAgICAgbmFtZTogdXNlci5uYW1lLFxuICAgICAgICAgICAgcm9sZTogdXNlci5yb2xlLFxuICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9OiBhbnkpIHtcbiAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgIHRva2VuLmlkID0gdXNlci5pZDtcbiAgICAgICAgdG9rZW4ucm9sZSA9IHVzZXIucm9sZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9LFxuICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9OiBhbnkpIHtcbiAgICAgIGlmIChzZXNzaW9uPy51c2VyKSB7XG4gICAgICAgIChzZXNzaW9uLnVzZXIgYXMgYW55KS5pZCA9IHRva2VuLmlkO1xuICAgICAgICAoc2Vzc2lvbi51c2VyIGFzIGFueSkucm9sZSA9IHRva2VuLnJvbGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9LFxuICB9LFxuICBwYWdlczoge1xuICAgIHNpZ25JbjogXCIvbG9naW5cIixcbiAgfSxcbiAgc2Vzc2lvbjoge1xuICAgIHN0cmF0ZWd5OiBcImp3dFwiLFxuICB9LFxuICBzZWNyZXQ6IHByb2Nlc3MuZW52Lk5FWFRBVVRIX1NFQ1JFVCxcbn07XG4iXSwibmFtZXMiOlsiQ3JlZGVudGlhbHNQcm92aWRlciIsInByaXNtYSIsImJjcnlwdCIsImF1dGhPcHRpb25zIiwicHJvdmlkZXJzIiwibmFtZSIsImNyZWRlbnRpYWxzIiwiZW1haWwiLCJsYWJlbCIsInR5cGUiLCJwYXNzd29yZCIsImF1dGhvcml6ZSIsInVzZXIiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJpc1ZhbGlkIiwiY29tcGFyZSIsInBhc3N3b3JkSGFzaCIsImlzQWN0aXZlIiwiaWQiLCJyb2xlIiwiY2FsbGJhY2tzIiwiand0IiwidG9rZW4iLCJzZXNzaW9uIiwicGFnZXMiLCJzaWduSW4iLCJzdHJhdGVneSIsInNlY3JldCIsInByb2Nlc3MiLCJlbnYiLCJORVhUQVVUSF9TRUNSRVQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth-options.ts\n");

/***/ }),

/***/ "(rsc)/./lib/db.ts":
/*!*******************!*\
  !*** ./lib/db.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZGIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQTZDO0FBRTdDLE1BQU1DLGtCQUFrQkM7QUFJakIsTUFBTUMsU0FBU0YsZ0JBQWdCRSxNQUFNLElBQUksSUFBSUgsd0RBQVlBLEdBQUU7QUFFbEUsSUFBSUksSUFBeUIsRUFBY0gsZ0JBQWdCRSxNQUFNLEdBQUdBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXBwLy4vbGliL2RiLnRzPzFkZjAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnXG5cbmNvbnN0IGdsb2JhbEZvclByaXNtYSA9IGdsb2JhbFRoaXMgYXMgdW5rbm93biBhcyB7XG4gIHByaXNtYTogUHJpc21hQ2xpZW50IHwgdW5kZWZpbmVkXG59XG5cbmV4cG9ydCBjb25zdCBwcmlzbWEgPSBnbG9iYWxGb3JQcmlzbWEucHJpc21hID8/IG5ldyBQcmlzbWFDbGllbnQoKVxuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA9IHByaXNtYVxuIl0sIm5hbWVzIjpbIlByaXNtYUNsaWVudCIsImdsb2JhbEZvclByaXNtYSIsImdsb2JhbFRoaXMiLCJwcmlzbWEiLCJwcm9jZXNzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/db.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fanalytics%2Froute&page=%2Fapi%2Fadmin%2Fanalytics%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fanalytics%2Froute.ts&appDir=D%3A%5CnextJSApps%5CnetaiLogistics%5Cnextjs_space%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CnextJSApps%5CnetaiLogistics%5Cnextjs_space&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();