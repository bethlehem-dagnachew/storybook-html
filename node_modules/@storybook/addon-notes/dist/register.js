"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = register;

var React = _interopRequireWildcard(require("react"));

var _addons = _interopRequireDefault(require("@storybook/addons"));

var _shared = require("./shared");

var _Panel = _interopRequireDefault(require("./Panel"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// TODO: fix eslint in tslint (igor said he fixed it, should ask him)
function register(type) {
  _addons["default"].register(_shared.ADDON_ID, function (api) {
    _addons["default"].add(_shared.PANEL_ID, {
      type: type,
      title: 'Notes',
      route: function route(_ref) {
        var storyId = _ref.storyId;
        return "/info/".concat(storyId);
      },
      // todo add type
      match: function match(_ref2) {
        var viewMode = _ref2.viewMode;
        return viewMode === 'info';
      },
      // todo add type
      render: function render(_ref3) {
        var active = _ref3.active,
            key = _ref3.key;
        return React.createElement(_Panel["default"], {
          api: api,
          active: active,
          key: key
        });
      },
      paramKey: _shared.PARAM_KEY
    });
  });
}