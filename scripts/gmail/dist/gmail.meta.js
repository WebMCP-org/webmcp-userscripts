// ==UserScript==
// @name         Gmail MCP-B Injector
// @namespace    https://github.com/miguelspizza/mcp-b-user-scripts
// @version      1.0.0
// @author       Alex Nahas
// @description  Injects MCP-B server into Gmail for AI assistant integration
// @license      MIT
// @homepageURL  https://github.com/miguelspizza/mcp-b-user-scripts
// @supportURL   https://github.com/miguelspizza/mcp-b-user-scripts/issues
// @match        https://mail.google.com/*
// @require      https://cdn.jsdelivr.net/npm/systemjs@6.15.1/dist/system.min.js
// @require      https://cdn.jsdelivr.net/npm/systemjs@6.15.1/dist/extras/named-register.min.js
// @require      data:application/javascript,%3B(typeof%20System!%3D'undefined')%26%26(System%3Dnew%20System.constructor())%3B
// @grant        GM.deleteValue
// @grant        GM.getValue
// @grant        GM.info
// @grant        GM.listValues
// @grant        GM.setValue
// @grant        unsafeWindow
// ==/UserScript==