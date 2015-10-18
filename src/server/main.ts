/// <reference path="../decls/node.d.ts" />
/// <reference path="../decls/express.d.ts" />
/// <reference path="../shared/include.ts" />

// config
var confAppIp: string = "localhost";
var confAppPort: number = 8102;

import express = require("express");

console.log("");
console.log("*********************");
console.log("*                   *");
console.log("*   JACOBS server   *");
console.log("*                   *");
console.log("*********************");
console.log("");

// APP
var app = express();
var server = require("http").createServer(app);

app.use("/", express.static("build/client"));

server.listen(confAppPort);
