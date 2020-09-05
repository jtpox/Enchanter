"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (auth) {
  return auth.password === process.env.RPC_PASSWORD;
};