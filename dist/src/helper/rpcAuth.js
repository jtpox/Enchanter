"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (auth) {
  if (auth.password === process.env.RPC_PASSWORD) {
    return true;
  }

  return false;
};