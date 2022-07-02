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

var ModalExtractSubtitles = /*#__PURE__*/function (_React$Component) {
  _inherits(ModalExtractSubtitles, _React$Component);

  var _super = _createSuper(ModalExtractSubtitles);

  function ModalExtractSubtitles(props) {
    var _this;

    _classCallCheck(this, ModalExtractSubtitles);

    _this = _super.call(this, props);
    _this.state = {
      appAddress: props.appAddress,
      assetDir: props.assetDir,
      dialogueShouldClose: props.dialogueShouldClose,
      refreshFileList: props.refreshFileList,
      responseMessage: null,
      streamNo: 0,
      videoName: props.videoName
    };
    _this.handleCloseClick = _this.handleCloseClick.bind(_assertThisInitialized(_this));
    _this.onstreamNoChange = _this.onstreamNoChange.bind(_assertThisInitialized(_this));
    _this.handleSubmitClick = _this.handleSubmitClick.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(ModalExtractSubtitles, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      $(this.modal).modal('show');

      window.onpopstate = function (e) {
        _this2.handleCloseClick();
      };
    }
  }, {
    key: "handleSubmitClick",
    value: function handleSubmitClick() {
      this.postDataToServer();
    }
  }, {
    key: "postDataToServer",
    value: function postDataToServer() {
      var _this3 = this;

      var payload = new FormData();
      payload.append('asset_dir', this.state.assetDir);
      payload.append('video_name', this.state.videoName);
      payload.append('stream_no', this.state.streamNo);
      axios({
        method: "post",
        url: this.state.appAddress + "/extract-subtitles/",
        data: payload
      }).then(function (response) {
        _this3.handleCloseClick();

        if (_this3.state.refreshFileList != null) {
          _this3.state.refreshFileList();
        }
      })["catch"](function (error) {
        console.log(error);

        _this3.setState({
          responseMessage: /*#__PURE__*/React.createElement("div", {
            className: "alert alert-danger my-2",
            role: "alert",
            style: {
              wordBreak: "break-word"
            }
          }, "Unable to extract subtitles from ", /*#__PURE__*/React.createElement("strong", {
            style: {
              wordBreak: "break-all"
            }
          }, _this3.state.videoName), ":", /*#__PURE__*/React.createElement("br", null), error.response.data)
        });
      });
    }
  }, {
    key: "onstreamNoChange",
    value: function onstreamNoChange(event) {
      this.setState({
        streamNo: event.target.value
      });
    }
  }, {
    key: "handleCloseClick",
    value: function handleCloseClick() {
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
        "aria-labelledby": "modal-extract-subtitles-title",
        "aria-hidden": "true",
        "data-bs-backdrop": "static"
      }, /*#__PURE__*/React.createElement("div", {
        className: "modal-dialog modal-dialog-scrollable",
        role: "document"
      }, /*#__PURE__*/React.createElement("div", {
        className: "modal-content"
      }, /*#__PURE__*/React.createElement("div", {
        className: "modal-header"
      }, /*#__PURE__*/React.createElement("h5", {
        className: "modal-title",
        id: "modal-extract-subtitles-title"
      }, "Extract Subtitles")), /*#__PURE__*/React.createElement("div", {
        className: "modal-body"
      }, /*#__PURE__*/React.createElement("div", {
        className: "mb-3"
      }, /*#__PURE__*/React.createElement("label", {
        htmlFor: "folder-name-input",
        className: "form-label"
      }, "Specify the stream ID (starting from 0) of the subtitles to be extracted:"), /*#__PURE__*/React.createElement("input", {
        id: "folder-name-input",
        type: "text",
        className: "form-control",
        placeholder: "Input folder name",
        value: this.state.streamNo,
        onChange: this.onstreamNoChange
      }), this.state.responseMessage, /*#__PURE__*/React.createElement("div", {
        className: "accordion my-2",
        id: "accordionRemove"
      }, /*#__PURE__*/React.createElement("div", {
        className: "accordion-item"
      }, /*#__PURE__*/React.createElement("h2", {
        className: "accordion-header",
        id: "headingRemove"
      }, /*#__PURE__*/React.createElement("button", {
        className: "accordion-button collapsed",
        type: "button",
        "data-bs-toggle": "collapse",
        "data-bs-target": "#collapseRemoveOne",
        "aria-expanded": "false",
        "aria-controls": "collapseRemoveOne"
      }, "What's Happening Under the Hood?")), /*#__PURE__*/React.createElement("div", {
        id: "collapseRemoveOne",
        className: "accordion-collapse collapse",
        "aria-labelledby": "headingRemove",
        "data-bs-parent": "#accordionRemove"
      }, /*#__PURE__*/React.createElement("div", {
        className: "accordion-body"
      }, /*#__PURE__*/React.createElement("ol", null, /*#__PURE__*/React.createElement("li", null, "Subtitle extraction is much less expensive compared with transcoding. You could expect the result within minutes;"), /*#__PURE__*/React.createElement("li", null, "You can check the ID of a stream by using the Video Info function;"), /*#__PURE__*/React.createElement("li", null, "The server uses ", /*#__PURE__*/React.createElement("code", null, "ffmpeg"), " to do the extraction. If ", /*#__PURE__*/React.createElement("code", null, "ffmpeg"), " returns a non-zero exit code, a log file will be generated.")))))))), /*#__PURE__*/React.createElement("div", {
        className: "modal-footer"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-secondary",
        onClick: this.handleCloseClick
      }, "Close"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-primary",
        onClick: this.handleSubmitClick
      }, "Submit")))));
    }
  }]);

  return ModalExtractSubtitles;
}(React.Component);

},{}]},{},[1]);
