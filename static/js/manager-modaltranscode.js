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

var ModalTranscode = /*#__PURE__*/function (_React$Component) {
  _inherits(ModalTranscode, _React$Component);

  var _super = _createSuper(ModalTranscode);

  function ModalTranscode(props) {
    var _this;

    _classCallCheck(this, ModalTranscode);

    _this = _super.call(this, props);
    _this.state = {
      appAddress: props.appAddress,
      audioID: -1,
      crf: 30,
      dialogueShouldClose: props.dialogueShouldClose,
      fileInfo: props.fileInfo,
      refreshFileList: props.refreshFileList,
      resolution: -1,
      threads: 0
    };
    _this.onAudioIDChange = _this.onAudioIDChange.bind(_assertThisInitialized(_this));
    _this.handleCloseClick = _this.handleCloseClick.bind(_assertThisInitialized(_this));
    _this.onCRFChange = _this.onCRFChange.bind(_assertThisInitialized(_this));
    _this.onResolutionChange = _this.onResolutionChange.bind(_assertThisInitialized(_this));
    _this.onThreadsChange = _this.onThreadsChange.bind(_assertThisInitialized(_this));
    _this.handleSubmitClick = _this.handleSubmitClick.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(ModalTranscode, [{
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
      payload.append('asset_dir', this.state.fileInfo.asset_dir);
      payload.append('audio_id', this.state.audioID);
      payload.append('video_name', this.state.fileInfo.filename);
      payload.append('crf', this.state.crf);
      payload.append('resolution', this.state.resolution);
      payload.append('threads', this.state.threads);
      axios({
        method: "post",
        url: this.state.appAddress + "/video-transcode/",
        data: payload
      }).then(function (response) {
        _this3.handleCloseClick();

        if (_this3.state.refreshFileList != null) {
          _this3.state.refreshFileList();
        }
      })["catch"](function (error) {
        _this3.setState({
          responseMessage: /*#__PURE__*/React.createElement("div", {
            className: "alert alert-danger my-2",
            role: "alert",
            style: {
              wordBreak: "break-word"
            }
          }, "Unable to transcode ", /*#__PURE__*/React.createElement("strong", {
            style: {
              wordBreak: "break-all"
            }
          }, payload.get('video_name')), ":", /*#__PURE__*/React.createElement("br", null), error.response.data)
        });
      });
    }
  }, {
    key: "onResolutionChange",
    value: function onResolutionChange(event) {
      this.setState({
        resolution: event.target.value
      });
      var autoCRF = 0;

      if (event.target.value === '1080') {
        autoCRF = 31;
      } else if (event.target.value === '720') {
        autoCRF = 32;
      } else if (event.target.value === '480') {
        autoCRF = 33;
      } else if (event.target.value === '360') {
        autoCRF = 36;
      } else if (event.target.value === '240') {
        autoCRF = 37;
      }

      if (autoCRF != 0) {
        this.setState({
          crf: autoCRF
        });
      }
    }
  }, {
    key: "onCRFChange",
    value: function onCRFChange(event) {
      this.setState({
        crf: event.target.value
      });
    }
  }, {
    key: "onThreadsChange",
    value: function onThreadsChange(event) {
      this.setState({
        threads: event.target.value
      });
    }
  }, {
    key: "onAudioIDChange",
    value: function onAudioIDChange(event) {
      this.setState({
        audioID: event.target.value
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

      if (this.state.show === false) {
        return null;
      }

      return /*#__PURE__*/React.createElement("div", {
        className: "modal fade",
        ref: function ref(modal) {
          return _this4.modal = modal;
        },
        role: "dialog",
        "data-bs-backdrop": "static",
        "aria-labelledby": "modal-video-transcode-title",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("div", {
        className: "modal-dialog modal-dialog-scrollable",
        role: "document"
      }, /*#__PURE__*/React.createElement("div", {
        className: "modal-content"
      }, /*#__PURE__*/React.createElement("div", {
        className: "modal-header"
      }, /*#__PURE__*/React.createElement("h5", {
        className: "modal-title",
        id: "modal-video-transcode-title"
      }, "Video Transcode")), /*#__PURE__*/React.createElement("div", {
        className: "modal-body"
      }, /*#__PURE__*/React.createElement("div", {
        className: "mb-3"
      }, /*#__PURE__*/React.createElement("span", {
        htmlFor: "exampleFormControlInput1",
        className: "form-label",
        style: {
          wordBreak: "break-word"
        }
      }, "Transcode video ", /*#__PURE__*/React.createElement("b", {
        style: {
          wordBreak: "break-all"
        }
      }, this.state.fileInfo.filename), " to WebM format (VP9) with the following parameters:"), /*#__PURE__*/React.createElement("div", {
        className: "input-group my-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "input-group-text"
      }, "CRF"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        className: "form-control",
        placeholder: "CRF",
        value: this.state.crf,
        onChange: this.onCRFChange
      }), /*#__PURE__*/React.createElement("span", {
        className: "input-group-text"
      }, "Audio ID"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        className: "form-control",
        placeholder: "Audio stream ID",
        value: this.state.audioID,
        onChange: this.onAudioIDChange
      })), /*#__PURE__*/React.createElement("div", {
        className: "input-group my-1"
      }, /*#__PURE__*/React.createElement("label", {
        className: "input-group-text",
        htmlFor: "inputSelectResolution"
      }, "Resolution"), /*#__PURE__*/React.createElement("select", {
        className: "form-select",
        id: "inputSelectResolution",
        defaultValue: -1,
        onChange: this.onResolutionChange
      }, /*#__PURE__*/React.createElement("option", {
        value: "-1"
      }, "Original"), /*#__PURE__*/React.createElement("option", {
        value: "1080"
      }, "1080p"), /*#__PURE__*/React.createElement("option", {
        value: "720"
      }, "720p"), /*#__PURE__*/React.createElement("option", {
        value: "480"
      }, "480p"), /*#__PURE__*/React.createElement("option", {
        value: "360"
      }, "360p"), /*#__PURE__*/React.createElement("option", {
        value: "240"
      }, "240p"), /*#__PURE__*/React.createElement("option", {
        value: "144"
      }, "144p"))), /*#__PURE__*/React.createElement("div", {
        className: "input-group my-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "input-group-text"
      }, "Threads"), /*#__PURE__*/React.createElement("input", {
        type: "number",
        className: "form-control",
        placeholder: "Number of threads",
        min: "1",
        max: "8",
        value: this.state.threads,
        onChange: this.onThreadsChange
      })), this.state.responseMessage, /*#__PURE__*/React.createElement("div", {
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
      }, /*#__PURE__*/React.createElement("ol", null, /*#__PURE__*/React.createElement("li", null, "The server will start a separate ", /*#__PURE__*/React.createElement("code", null, "ffmpeg"), " process to do the conversion;"), /*#__PURE__*/React.createElement("li", null, "The constant rate factor (CRF) can be from 0-63. Lower values mean better quality; According to ", /*#__PURE__*/React.createElement("a", {
        href: "https://trac.ffmpeg.org/wiki/Encode/VP9",
        target: "_blank"
      }, "ffmpeg's manual"), ", for WebM format (VP9 video encoder), recommended values range from 15-35;"), /*#__PURE__*/React.createElement("li", null, "After selecting the video quality, a CRF value will be automatically set according to ", /*#__PURE__*/React.createElement("a", {
        href: "https://developers.google.com/media/vp9/settings/vod/",
        target: "_blank"
      }, "Google's recommendation"), ";"), /*#__PURE__*/React.createElement("li", null, "According to ", /*#__PURE__*/React.createElement("a", {
        href: "https://developers.google.com/media/vp9/the-basics",
        target: "_blank"
      }, "Google's manual"), ", for VP9, 480p is considered a safe resolution for a broad range of mobile and web devices."), /*#__PURE__*/React.createElement("li", null, "Since modern browsers will pick the first audio stream (ID==0) and manual audio stream selection is usually not possible, you can pick the preferred audio stream by its ID before transcoding so that it becomes the only audio stream which will definitely be selected by browsers. You can find the ID using ", /*#__PURE__*/React.createElement("code", null, "Video Info"), " function."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("code", null, "threads"), " can only be from 0 to 8 where 0 means ffmpeg selects the optimal value by itself. Note that a large ", /*#__PURE__*/React.createElement("code", null, "threads"), " value may or may not translate to high performance but a small ", /*#__PURE__*/React.createElement("code", null, "threads"), " will guarantee lower CPU usage.")))))))), /*#__PURE__*/React.createElement("div", {
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

  return ModalTranscode;
}(React.Component);

},{}]},{},[1]);
