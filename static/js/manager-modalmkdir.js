(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModalMkdir = void 0;

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

var ModalMkdir = /*#__PURE__*/function (_React$Component) {
  _inherits(ModalMkdir, _React$Component);

  var _super = _createSuper(ModalMkdir);

  function ModalMkdir(props) {
    var _this;

    _classCallCheck(this, ModalMkdir);

    _this = _super.call(this, props);
    _this.state = {
      appAddress: props.appAddress,
      assetDir: props.assetDir,
      dialogueShouldClose: props.dialogueShouldClose,
      folderName: 'New Folder',
      refreshFileList: props.refreshFileList,
      responseMessage: null
    };
    _this.handleCloseClick = _this.handleCloseClick.bind(_assertThisInitialized(_this));
    _this.onFolderNameChange = _this.onFolderNameChange.bind(_assertThisInitialized(_this));
    _this.handleSubmitClick = _this.handleSubmitClick.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(ModalMkdir, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      $(this.modal).modal('show');

      window.onpopstate = function (e) {
        _this2.handleCloseClick();
      };
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      var _this3 = this;

      window.onpopstate = function (e) {
        $(_this3.modal).modal('hide');
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
      var _this4 = this;

      var payload = new FormData();
      payload.append('asset_dir', this.state.assetDir);
      payload.append('folder_name', this.state.folderName);
      axios({
        method: "post",
        url: this.state.appAddress + "/create-folder/",
        data: payload
      }).then(function (response) {
        _this4.handleCloseClick();

        if (_this4.state.refreshFileList != null) {
          _this4.state.refreshFileList();
        }
      })["catch"](function (error) {
        _this4.setState({
          responseMessage: /*#__PURE__*/React.createElement("div", {
            className: "alert alert-danger my-2",
            role: "alert",
            style: {
              wordBreak: "break-word"
            }
          }, "Unable to create new folder ", /*#__PURE__*/React.createElement("strong", {
            style: {
              wordBreak: "break-all"
            }
          }, payload.get('folder_name')), ":", /*#__PURE__*/React.createElement("br", null), error.response.data)
        });
      });
    }
  }, {
    key: "onFolderNameChange",
    value: function onFolderNameChange(event) {
      this.setState({
        folderName: event.target.value
      });
    }
  }, {
    key: "handleCloseClick",
    value: function handleCloseClick() {
      $(this.modal).modal('hide');

      if (this.state.dialogueShouldClose != null) {
        this.state.dialogueShouldClose();
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this5 = this;

      return /*#__PURE__*/React.createElement("div", {
        className: "modal fade",
        ref: function ref(modal) {
          return _this5.modal = modal;
        },
        role: "dialog",
        "aria-labelledby": "exampleModalLabel",
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
        id: "exampleModalLabel"
      }, "New Folder")), /*#__PURE__*/React.createElement("div", {
        className: "modal-body"
      }, /*#__PURE__*/React.createElement("div", {
        className: "mb-3"
      }, /*#__PURE__*/React.createElement("label", {
        htmlFor: "folder-name-input",
        className: "form-label"
      }, "Input the name of the folder to be created:"), /*#__PURE__*/React.createElement("input", {
        id: "folder-name-input",
        type: "text",
        className: "form-control",
        placeholder: "Input folder name",
        value: this.state.folderName,
        onChange: this.onFolderNameChange
      })), this.state.responseMessage), /*#__PURE__*/React.createElement("div", {
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

  return ModalMkdir;
}(React.Component);

exports.ModalMkdir = ModalMkdir;

},{}]},{},[1]);
