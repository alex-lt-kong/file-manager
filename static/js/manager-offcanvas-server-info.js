(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var OffcanvasServerInfo = /*#__PURE__*/function (_React$Component) {
  _inherits(OffcanvasServerInfo, _React$Component);

  var _super = _createSuper(OffcanvasServerInfo);

  function OffcanvasServerInfo(props) {
    var _this;

    _classCallCheck(this, OffcanvasServerInfo);

    _this = _super.call(this, props);
    _this.state = {
      appAddress: props.appAddress,
      serverInfoPanel: null
    };
    return _this;
  }

  _createClass(OffcanvasServerInfo, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      //  $(this.offcanvas).offcanvas('show');
      console.log('componentDidMount'); //  this.fetchServerInfo();
    }
  }, {
    key: "fetchServerInfo",
    value: function fetchServerInfo() {
      var _this2 = this;

      URL = this.state.appAddress + '/get-server-info/';
      this.setState({
        serverInfoPanel: /*#__PURE__*/React.createElement("div", {
          className: "d-flex align-items-center justify-content-center"
        }, /*#__PURE__*/React.createElement("div", {
          className: "spinner-border text-primary",
          role: "status"
        }, /*#__PURE__*/React.createElement("span", {
          className: "visually-hidden"
        }, "Loading...")))
      });
      this.forceUpdate(); // You set it to a spinner before fetching data from the server.

      axios.get(URL).then(function (response) {
        _this2.setState({
          serverInfo: null // make it empty before fill it in again to force a re-rendering.

        });

        _this2.setState({
          serverInfo: response.data // make it empty before fill it in again to force a re-rendering.

        });

        var ffmpegItems = _this2.state.serverInfo.ffmpeg.map(function (ffmpegItem) {
          return /*#__PURE__*/React.createElement("li", {
            key: ffmpegItem.pid,
            style: {
              wordBreak: "break-all"
            }
          }, ffmpegItem.cmdline, " ", /*#__PURE__*/React.createElement("b", null, "(since ", ffmpegItem.since, ")"));
        });

        _this2.setState({
          serverInfoPanel: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "CPU Usage: "), _this2.state.serverInfo.cpu.percent.map(function (p) {
            return p.toString() + "% ";
          })), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "Memory: "), Math.round(_this2.state.serverInfo.memory.physical_total / 1024 / 1024).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), " MB in total,\xA0", Math.round(_this2.state.serverInfo.memory.physical_available / 1024 / 1024).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), " MB free"), /*#__PURE__*/React.createElement("b", null, "System:"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "OS:"), " ", _this2.state.serverInfo.version.os), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "Python:"), " ", _this2.state.serverInfo.version.python), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "Flask:"), " ", _this2.state.serverInfo.version.flask)), /*#__PURE__*/React.createElement("b", null, "FFMPEG:"), /*#__PURE__*/React.createElement("ol", null, ffmpegItems))
        });

        _this2.forceUpdate();
      })["catch"](function (error) {
        console.log(error);
        alert('Unable to fetch server info:\n' + error.response.data);
      });
    }
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/React.createElement("div", {
        className: "offcanvas offcanvas-bottom h-auto",
        id: "offcanvasBottomServerInfo",
        "aria-labelledby": "offcanvasBottomServerInfoLabel"
      }, /*#__PURE__*/React.createElement("div", {
        className: "offcanvas-header"
      }, /*#__PURE__*/React.createElement("h5", {
        className: "offcanvas-title",
        id: "offcanvasBottomServerInfoLabel"
      }, /*#__PURE__*/React.createElement("b", null, "Server Info")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn-close text-reset",
        "data-bs-dismiss": "offcanvas",
        "aria-label": "Close"
      })), /*#__PURE__*/React.createElement("div", {
        className: "offcanvas-body",
        style: {
          fontSize: "0.85em"
        }
      }, this.state.serverInfoPanel));
    }
  }]);

  return OffcanvasServerInfo;
}(React.Component);

},{}]},{},[1]);
