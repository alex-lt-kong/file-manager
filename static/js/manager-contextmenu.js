(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContextMenu = void 0;

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

var ContextMenu = /*#__PURE__*/function (_React$Component) {
  _inherits(ContextMenu, _React$Component);

  var _super = _createSuper(ContextMenu);

  function ContextMenu(props) {
    var _this;

    _classCallCheck(this, ContextMenu);

    _this = _super.call(this, props);
    _this.state = {
      appAddress: props.appAddress,
      modalDialogue: null,
      refreshFileList: props.refreshFileList,
      fileInfo: props.fileInfo
    };
    _this.dialogueShouldClose = _this.dialogueShouldClose.bind(_assertThisInitialized(_this));
    _this.onExtractSubtitlesButtonClick = _this.onExtractSubtitlesButtonClick.bind(_assertThisInitialized(_this));
    _this.onMoveButtonClick = _this.onMoveButtonClick.bind(_assertThisInitialized(_this));
    _this.onViewTextButtonClick = _this.onViewTextButtonClick.bind(_assertThisInitialized(_this));
    _this.onRemoveButtonClick = _this.onRemoveButtonClick.bind(_assertThisInitialized(_this));
    _this.onTranscodeButtonClick = _this.onTranscodeButtonClick.bind(_assertThisInitialized(_this));
    _this.onMediaInfoButtonClick = _this.onMediaInfoButtonClick.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(ContextMenu, [{
    key: "dialogueShouldClose",
    value: function dialogueShouldClose() {
      this.state.modalDialogue = null;
      this.forceUpdate();
    }
  }, {
    key: "onRemoveButtonClick",
    value: function onRemoveButtonClick(event) {
      this.setState({
        modalDialogue: /*#__PURE__*/React.createElement(ModalRemove, {
          fileInfo: this.state.fileInfo,
          appAddress: this.state.appAddress,
          dialogueShouldClose: this.dialogueShouldClose,
          refreshFileList: this.state.refreshFileList
        })
      });
      this.forceUpdate();
    }
  }, {
    key: "onViewTextButtonClick",
    value: function onViewTextButtonClick(event) {
      window.open(this.state.appAddress + '/view-text/?asset_dir=' + encodeURIComponent(this.state.fileInfo.asset_dir) + '&filename=' + encodeURIComponent(this.state.fileInfo.filename));
    }
  }, {
    key: "onExtractSubtitlesButtonClick",
    value: function onExtractSubtitlesButtonClick(event) {
      this.setState({
        modalDialogue: /*#__PURE__*/React.createElement(ModalExtractSubtitles, {
          appAddress: this.state.appAddress,
          assetDir: this.state.fileInfo.asset_dir,
          dialogueShouldClose: this.dialogueShouldClose,
          videoName: this.state.fileInfo.filename,
          refreshFileList: this.state.refreshFileList
        })
      });
      this.forceUpdate();
    }
  }, {
    key: "onMediaInfoButtonClick",
    value: function onMediaInfoButtonClick(event) {
      this.setState({
        modalDialogue: /*#__PURE__*/React.createElement(ModalMediaInfo, {
          appAddress: this.state.appAddress,
          assetDir: this.state.fileInfo.asset_dir,
          dialogueShouldClose: this.dialogueShouldClose,
          mediaFilename: this.state.fileInfo.filename
        })
      });
      this.forceUpdate();
    }
  }, {
    key: "onMoveButtonClick",
    value: function onMoveButtonClick(event) {
      this.setState({
        modalDialogue: /*#__PURE__*/React.createElement(ModalMove, {
          dialogueShouldClose: this.dialogueShouldClose,
          fileInfo: this.state.fileInfo,
          appAddress: this.state.appAddress,
          refreshFileList: this.state.refreshFileList
        })
      });
      this.forceUpdate();
    }
  }, {
    key: "onTranscodeButtonClick",
    value: function onTranscodeButtonClick(event) {
      this.setState({
        modalDialogue: /*#__PURE__*/React.createElement(ModalTranscode, {
          fileInfo: this.state.fileInfo,
          appAddress: this.state.appAddress,
          dialogueShouldClose: this.dialogueShouldClose,
          refreshFileList: this.state.refreshFileList
        }) // By adding a key attribute, Modal will be created each time, so we
        // can pass different show attribute to it.

      });
      this.forceUpdate();
    }
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/React.createElement("div", {
        className: "dropdown",
        href: "javascript:return false;",
        style: {
          position: "relative"
        }
      }, /*#__PURE__*/React.createElement("i", {
        id: "dropdownContextMenuButton",
        className: "bi bi-three-dots-vertical",
        "data-bs-toggle": "dropdown",
        "aria-expanded": "false",
        style: {
          cursor: "pointer",
          fontSize: "1.2em"
        }
      }), /*#__PURE__*/React.createElement("ul", {
        className: "dropdown-menu",
        "aria-labelledby": "dropdownContextMenuButton"
      }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
        className: "dropdown-item py-2",
        style: {
          cursor: "pointer"
        },
        onClick: this.onViewTextButtonClick
      }, "View As Text")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
        className: "dropdown-item py-2",
        style: {
          cursor: "pointer"
        },
        onClick: this.onMoveButtonClick
      }, "Move")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
        className: "dropdown-item py-2",
        style: {
          cursor: "pointer"
        },
        onClick: this.onRemoveButtonClick
      }, "Remove")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
        className: "dropdown-item py-2",
        style: {
          cursor: "pointer"
        },
        onClick: this.onMediaInfoButtonClick
      }, "Media Info")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
        className: "dropdown-item py-2",
        style: {
          cursor: "pointer"
        },
        onClick: this.onTranscodeButtonClick
      }, "Transcode to WebM")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
        className: "dropdown-item py-2",
        style: {
          cursor: "pointer"
        },
        onClick: this.onExtractSubtitlesButtonClick
      }, "Extract Subtitles"))), this.state.modalDialogue);
    }
  }]);

  return ContextMenu;
}(React.Component);

exports.ContextMenu = ContextMenu;

},{}]},{},[1]);
