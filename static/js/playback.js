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

var PlayBack = /*#__PURE__*/function (_React$Component) {
  _inherits(PlayBack, _React$Component);

  var _super = _createSuper(PlayBack);

  function PlayBack(props) {
    var _this;

    _classCallCheck(this, PlayBack);

    _this = _super.call(this, props);
    _this.state = {
      appAddress: props.appAddress,
      assetDir: props.assetDir,
      jsonHTML: null,
      subtitlesURL: props.appAddress + '/download/?asset_dir=' + encodeURIComponent(props.assetDir) + '&filename=' + encodeURIComponent(props.videoName) + '.vtt',
      lastView: props.lastView,
      videoInfo: null,
      videoName: props.videoName,
      videoPlaybackRate: 1,
      views: props.views,
      username: null
    };
    _this.onPlaybackSpeedInputChange = _this.onPlaybackSpeedInputChange.bind(_assertThisInitialized(_this));
    _this.onPlayFasterButtonClick = _this.onPlayFasterButtonClick.bind(_assertThisInitialized(_this));
    _this.onPlaySlowerButtonClick = _this.onPlaySlowerButtonClick.bind(_assertThisInitialized(_this));
    _this.onSubtitlesURLTextareaChange = _this.onSubtitlesURLTextareaChange.bind(_assertThisInitialized(_this));
    _this.onCanPlayEvent = _this.onCanPlayEvent.bind(_assertThisInitialized(_this));
    _this.videoURL = _this.state.appAddress + '/download/?asset_dir=' + encodeURIComponent(_this.state.assetDir) + '&filename=' + encodeURIComponent(_this.state.videoName) + '&as_attachment=0';
    _this.videoRef = React.createRef();
    return _this;
  }

  _createClass(PlayBack, [{
    key: "onPlaybackSpeedInputChange",
    value: function onPlaybackSpeedInputChange(event) {
      var _this2 = this;

      console.log('onPlaybackSpeedInputChange');

      if (isNaN(parseFloat(event.target.value)) || parseFloat(event.target.value) <= 0.2 || parseFloat(event.target.value) > 10) {
        return;
      }

      console.log('onPlaybackSpeedInputChange continue');
      console.log(parseFloat(event.target.value));
      this.setState({
        videoPlaybackRate: parseFloat(event.target.value)
      }, function () {
        _this2.videoRef.current.playbackRate = _this2.state.videoPlaybackRate;
      });
    }
  }, {
    key: "onPlayFasterButtonClick",
    value: function onPlayFasterButtonClick(event) {
      var _this3 = this;

      this.setState(function (prevState) {
        return {
          videoPlaybackRate: prevState.videoPlaybackRate + 0.1
        };
      }, function () {
        _this3.videoRef.current.playbackRate = _this3.state.videoPlaybackRate;
      });
    }
  }, {
    key: "onPlaySlowerButtonClick",
    value: function onPlaySlowerButtonClick(event) {
      var _this4 = this;

      if (this.state.videoPlaybackRate <= 0.2) {
        return;
      }

      this.setState(function (prevState) {
        return {
          videoPlaybackRate: prevState.videoPlaybackRate - 0.1
        };
      }, function () {
        _this4.videoRef.current.playbackRate = _this4.state.videoPlaybackRate;
      });
    }
  }, {
    key: "onCanPlayEvent",
    value: function onCanPlayEvent(event) {
      this.videoRef.current.playbackRate = 3;
    }
  }, {
    key: "onSubtitlesURLTextareaChange",
    value: function onSubtitlesURLTextareaChange(event) {
      this.setState({
        subtitlesURL: event.target.value
      });
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.fetchDataFromServer(this.state.currentPath);
    }
  }, {
    key: "fetchDataFromServer",
    value: function fetchDataFromServer() {
      var _this5 = this;

      URL = this.state.appAddress + '/get-media-info/?asset_dir=' + encodeURIComponent(this.state.assetDir) + '&media_filename=' + encodeURIComponent(this.state.videoName);
      axios.get(URL).then(function (response) {
        _this5.setState({
          videoInfo: null
        });

        _this5.setState({
          videoInfo: response.data,
          jsonHTML: syntaxHighlight(JSON.stringify(response.data.content, null, 2))
        });
      })["catch"](function (error) {
        _this5.setState({
          jsonHTML: /*#__PURE__*/React.createElement("div", {
            className: "alert alert-danger my-2",
            role: "alert",
            style: {
              wordBreak: "break-word"
            }
          }, "Unable to fetch information from media ", /*#__PURE__*/React.createElement("strong", {
            style: {
              wordBreak: "break-all"
            }
          }, _this5.state.mediaFilename), ":", /*#__PURE__*/React.createElement("br", null), error.response.data),
          mediaInfo: false
        });
      });
    }
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/React.createElement("div", {
        className: "container-fluid my-2"
      }, /*#__PURE__*/React.createElement("div", {
        className: "row flex-row-reverse"
      }, /*#__PURE__*/React.createElement("div", {
        className: "col-sm-3 col-md-pull-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "accordion mb-2",
        id: "accordionExample"
      }, /*#__PURE__*/React.createElement("div", {
        className: "accordion-item"
      }, /*#__PURE__*/React.createElement("h2", {
        className: "accordion-header",
        id: "headingOne"
      }, /*#__PURE__*/React.createElement("button", {
        className: "accordion-button",
        type: "button",
        "data-bs-toggle": "collapse",
        "data-bs-target": "#collapseOne",
        "aria-expanded": "true",
        "aria-controls": "collapseOne"
      }, "Basic Information")), /*#__PURE__*/React.createElement("div", {
        id: "collapseOne",
        className: "accordion-collapse collapse show",
        "aria-labelledby": "headingOne"
      }, /*#__PURE__*/React.createElement("div", {
        className: "accordion-body"
      }, /*#__PURE__*/React.createElement("p", {
        className: "my-1",
        style: {
          wordBreak: "break-all"
        }
      }, /*#__PURE__*/React.createElement("b", null, "Name: "), this.state.videoName), /*#__PURE__*/React.createElement("p", {
        className: "my-1",
        style: {
          wordBreak: "break-all"
        }
      }, /*#__PURE__*/React.createElement("b", null, "URL: "), /*#__PURE__*/React.createElement("a", {
        href: this.videoURL
      }, this.videoURL)), /*#__PURE__*/React.createElement("p", {
        className: "my-1",
        style: {
          wordBreak: "break-all"
        }
      }, /*#__PURE__*/React.createElement("b", null, "Views: "), this.state.views), /*#__PURE__*/React.createElement("p", {
        className: "my-1",
        style: {
          wordBreak: "break-all"
        }
      }, /*#__PURE__*/React.createElement("b", null, "Last View: "), this.state.lastView)))), /*#__PURE__*/React.createElement("div", {
        className: "accordion-item"
      }, /*#__PURE__*/React.createElement("h2", {
        className: "accordion-header",
        id: "headingTwo"
      }, /*#__PURE__*/React.createElement("button", {
        className: "accordion-button ".concat(screen.width > 1000 ? "" : "collapsed"),
        type: "button",
        "data-bs-toggle": "collapse",
        "data-bs-target": "#collapseTwo",
        "aria-expanded": screen.width > 1000,
        "aria-controls": "collapseTwo"
      }, "Technical Information")), /*#__PURE__*/React.createElement("div", {
        id: "collapseTwo",
        className: "accordion-collapse collapse ".concat(screen.width > 1000 ? "show" : ""),
        "aria-labelledby": "headingTwo"
      }, /*#__PURE__*/React.createElement("div", {
        className: "accordion-body"
      }, this.state.jsonHTML))))), /*#__PURE__*/React.createElement("div", {
        className: "col-sm-9 col-md-push-9"
      }, /*#__PURE__*/React.createElement("video", {
        style: {
          width: "100%",
          maxHeight: "90vh",
          backgroundColor: "black"
        },
        ref: this.videoRef,
        autoPlay: true,
        controls: true
      }, /*#__PURE__*/React.createElement("source", {
        src: this.videoURL
      }), /*#__PURE__*/React.createElement("textarea", {
        className: "form-control",
        style: {
          wordBreak: "break-all"
        },
        "aria-label": "With textarea",
        onChange: this.onSubtitlesURLTextareaChange,
        value: this.state.subtitlesURL
      }), /*#__PURE__*/React.createElement("track", {
        label: "English",
        kind: "subtitles",
        srcLang: "en",
        src: this.state.subtitlesURL,
        "default": true
      }), "Your browser does not support the video tag."), /*#__PURE__*/React.createElement("div", {
        className: "container-fluid px-0"
      }, /*#__PURE__*/React.createElement("div", {
        className: "row"
      }, /*#__PURE__*/React.createElement("div", {
        className: "col-xl-9"
      }, /*#__PURE__*/React.createElement("div", {
        className: "input-group"
      }, /*#__PURE__*/React.createElement("span", {
        className: "input-group-text font-monospace"
      }, "Subs\xA0"), /*#__PURE__*/React.createElement("textarea", {
        className: "form-control",
        "aria-label": "With textarea",
        rows: screen.width > 1000 ? 1 : 3,
        style: {
          fontSize: "1em",
          wordBreak: "break-all"
        },
        onChange: this.onSubtitlesURLTextareaChange,
        value: this.state.subtitlesURL
      }))), /*#__PURE__*/React.createElement("div", {
        className: "col-xl-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "input-group"
      }, /*#__PURE__*/React.createElement("span", {
        className: "input-group-text font-monospace"
      }, "Speed"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        className: "form-control",
        placeholder: "Playback speed",
        onChange: this.onPlaybackSpeedInputChange,
        value: this.state.videoPlaybackRate.toFixed(1)
      }), /*#__PURE__*/React.createElement("button", {
        className: "btn btn-primary",
        type: "button",
        onClick: this.onPlaySlowerButtonClick
      }, /*#__PURE__*/React.createElement("i", {
        className: "bi bi-chevron-double-left"
      })), /*#__PURE__*/React.createElement("button", {
        className: "btn btn-primary",
        type: "button",
        onClick: this.onPlayFasterButtonClick
      }, /*#__PURE__*/React.createElement("i", {
        className: "bi bi-chevron-double-right"
      })))))))));
    }
  }]);

  return PlayBack;
}(React.Component);

ReactDOM.render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PlayBack, {
  appAddress: app_address,
  assetDir: paras['asset_dir'],
  videoName: paras['video_name'],
  views: paras['views'],
  lastView: paras['last_view']
})), document.querySelector('#root'));

},{}]},{},[1]);
