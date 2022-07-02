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

var ModalMediaInfo = /*#__PURE__*/function (_React$Component) {
  _inherits(ModalMediaInfo, _React$Component);

  var _super = _createSuper(ModalMediaInfo);

  function ModalMediaInfo(props) {
    var _this;

    _classCallCheck(this, ModalMediaInfo);

    _this = _super.call(this, props);
    _this.state = {
      appAddress: props.appAddress,
      assetDir: props.assetDir,
      dialogueShouldClose: props.dialogueShouldClose,
      jsonHTML: /*#__PURE__*/React.createElement("div", {
        className: "d-flex align-items-center justify-content-center"
      }, /*#__PURE__*/React.createElement("div", {
        className: "spinner-border text-primary",
        role: "status"
      }, /*#__PURE__*/React.createElement("span", {
        className: "visually-hidden"
      }, "Loading..."))),
      mediaFilename: props.mediaFilename,
      mediaInfo: null
    };
    _this.handleOKClick = _this.handleOKClick.bind(_assertThisInitialized(_this));

    _this.fetchDataFromServer();

    return _this;
  }

  _createClass(ModalMediaInfo, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      $(this.modal).modal('show');

      window.onpopstate = function (e) {
        _this2.handleOKClick();
      };
    }
  }, {
    key: "fetchDataFromServer",
    value: function fetchDataFromServer() {
      var _this3 = this;

      URL = this.state.appAddress + '/get-media-info/?asset_dir=' + encodeURIComponent(this.state.assetDir) + '&media_filename=' + encodeURIComponent(this.state.mediaFilename);
      axios.get(URL).then(function (response) {
        _this3.setState({
          mediaInfo: null
        });

        _this3.setState({
          mediaInfo: response.data,
          jsonHTML: syntaxHighlight(JSON.stringify(response.data.content, null, 2))
        });
      })["catch"](function (error) {
        _this3.setState({
          jsonHTML: /*#__PURE__*/React.createElement("div", {
            className: "alert alert-danger my-2",
            role: "alert",
            style: {
              wordBreak: "break-word"
            }
          }, "Unable to fetch information from media file ", /*#__PURE__*/React.createElement("strong", {
            style: {
              wordBreak: "break-all"
            }
          }, _this3.state.mediaFilename), ":", /*#__PURE__*/React.createElement("br", null), error.response.data),
          mediaInfo: false
        });
      });
    }
  }, {
    key: "handleOKClick",
    value: function handleOKClick() {
      $(this.modal).modal('hide');

      if (this.state.dialogueShouldClose != null) {
        this.state.dialogueShouldClose();
      }
      /* When we want to close it, we need to do two things:
        1. we set hide to the modal within this component;
        2. we need to call a callback function to notify the parent component that the children component wants itself to be closed.
        We canNOT only do the 1st thing; otherwise the modal dialogue will be hidden, but it is not destroyed.
      */

    }
  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      return /*#__PURE__*/React.createElement("div", {
        className: "modal fade",
        ref: function ref(modal) {
          return _this4.modal = modal;
        },
        role: "dialog",
        "aria-labelledby": "mediaInformationModalTitle",
        "aria-hidden": "true",
        "data-bs-backdrop": "static"
      }, /*#__PURE__*/React.createElement("div", {
        className: "modal-dialog  modal-dialog-scrollable",
        role: "document"
      }, /*#__PURE__*/React.createElement("div", {
        className: "modal-content"
      }, /*#__PURE__*/React.createElement("div", {
        className: "modal-header"
      }, /*#__PURE__*/React.createElement("h5", {
        className: "modal-title",
        id: "mediaInformationModalTitle"
      }, "Media Information")), /*#__PURE__*/React.createElement("div", {
        className: "modal-body"
      }, /*#__PURE__*/React.createElement("div", {
        className: "mb-3"
      }, this.state.jsonHTML)), /*#__PURE__*/React.createElement("div", {
        className: "modal-footer"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-primary",
        onClick: this.handleOKClick
      }, "OK")))));
    }
  }]);

  return ModalMediaInfo;
}(React.Component);

},{}]},{},[1]);
