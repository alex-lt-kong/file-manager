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

var ModalRemove = /*#__PURE__*/function (_React$Component) {
  _inherits(ModalRemove, _React$Component);

  var _super = _createSuper(ModalRemove);

  function ModalRemove(props) {
    var _this;

    _classCallCheck(this, ModalRemove);

    _this = _super.call(this, props);
    _this.state = {
      appAddress: props.appAddress,
      dialogueShouldClose: props.dialogueShouldClose,
      fileInfo: props.fileInfo,
      refreshFileList: props.refreshFileList,
      responseMessage: null
    };
    _this.handleCloseClick = _this.handleCloseClick.bind(_assertThisInitialized(_this));
    _this.handleSubmitClick = _this.handleSubmitClick.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(ModalRemove, [{
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
      payload.append('filepath', this.state.fileInfo.asset_dir + this.state.fileInfo.filename);
      axios({
        method: "post",
        url: this.state.appAddress + "/remove/",
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
          }, "Unable to remove ", /*#__PURE__*/React.createElement("strong", {
            style: {
              wordBreak: "break-all"
            }
          }, _this3.state.fileInfo.filename), ":", /*#__PURE__*/React.createElement("br", null), error.response.data)
        });
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
        "aria-labelledby": "modal-remove-file-title",
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
        id: "modal-remove-file-title"
      }, "Remove File")), /*#__PURE__*/React.createElement("div", {
        className: "modal-body"
      }, /*#__PURE__*/React.createElement("div", {
        className: "mb-3"
      }, /*#__PURE__*/React.createElement("span", {
        className: "form-label",
        style: {
          wordBreak: "break-all"
        }
      }, "Remove file ", /*#__PURE__*/React.createElement("strong", null, this.state.fileInfo.asset_dir + this.state.fileInfo.filename), "?"), this.state.responseMessage, /*#__PURE__*/React.createElement("div", {
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
      }, /*#__PURE__*/React.createElement("ol", null, /*#__PURE__*/React.createElement("li", null, "The server returns an error message if ", /*#__PURE__*/React.createElement("a", {
        href: "https://docs.python.org/3/library/os.path.html#os.path.ismount",
        target: "_blank"
      }, "os.path.ismount()"), " returns true;"), /*#__PURE__*/React.createElement("li", null, "The server calls ", /*#__PURE__*/React.createElement("a", {
        href: "https://docs.python.org/3/library/os.html#os.unlink",
        target: "_blank"
      }, "os.unlink()"), " if ", /*#__PURE__*/React.createElement("a", {
        href: "https://docs.python.org/3/library/os.path.html#os.path.islink",
        target: "_blank"
      }, "os.path.islink()"), " returns true;"), /*#__PURE__*/React.createElement("li", null, "The server calls ", /*#__PURE__*/React.createElement("a", {
        href: "https://docs.python.org/3/library/os.html#os.remove",
        target: "_blank"
      }, "os.remove()"), " if ", /*#__PURE__*/React.createElement("a", {
        href: "https://docs.python.org/3/library/os.path.html#os.path.isfile",
        target: "_blank"
      }, "os.path.isfile()"), " returns true;"), /*#__PURE__*/React.createElement("li", null, "The server calls ", /*#__PURE__*/React.createElement("a", {
        href: "https://docs.python.org/3/library/os.html#os.rmdir",
        target: "_blank"
      }, "shutil.rmtree()"), " if ", /*#__PURE__*/React.createElement("a", {
        href: "https://docs.python.org/3/library/shutil.html#shutil.rmtree",
        target: "_blank"
      }, "os.path.isdir()"), " returns true;"), /*#__PURE__*/React.createElement("li", null, "The serve returns an error if all of the above conditions are not met.")))))))), /*#__PURE__*/React.createElement("div", {
        className: "modal-footer"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-secondary",
        onClick: this.handleCloseClick
      }, "No"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-primary",
        onClick: this.handleSubmitClick
      }, "YES!")))));
    }
  }]);

  return ModalRemove;
}(React.Component);

},{}]},{},[1]);
