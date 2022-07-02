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

var ModalMove = /*#__PURE__*/function (_React$Component) {
  _inherits(ModalMove, _React$Component);

  var _super = _createSuper(ModalMove);

  function ModalMove(props) {
    var _this;

    _classCallCheck(this, ModalMove);

    _this = _super.call(this, props);
    _this.state = {
      appAddress: props.appAddress,
      dialogueShouldClose: props.dialogueShouldClose,
      disableSubmitByDirName: false,
      disableSubmitByFileName: false,
      disableSubmitBySubmit: false,
      fileInfo: props.fileInfo,
      newFileDir: props.fileInfo.asset_dir,
      newFileName: props.fileInfo.filename,
      refreshFileList: props.refreshFileList,
      responseMessage: null
    };
    _this.handleCloseClick = _this.handleCloseClick.bind(_assertThisInitialized(_this));
    _this.handleRegularizationClick = _this.handleRegularizationClick.bind(_assertThisInitialized(_this));
    _this.handleSubmitClick = _this.handleSubmitClick.bind(_assertThisInitialized(_this));
    _this.onFileDirChange = _this.onFileDirChange.bind(_assertThisInitialized(_this));
    _this.onFileNameChange = _this.onFileNameChange.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(ModalMove, [{
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
      this.setState({
        disableSubmitBySubmit: true
      }); // The move operation is different from many other methods because it is synchronous.
      // So we disable the submit button to prevent users from clicking it twice--by rights,
      // clicking it twice should not cause any issue since the second move will be blocked (FileExistsError) anyway.
      // It is mainly used to reduce users confusion.

      this.fetchDataFromServer();
    }
  }, {
    key: "handleRegularizationClick",
    value: function handleRegularizationClick() {
      this.setState(function (prevState) {
        return {
          newFileName: prevState.newFileName.toLowerCase().replace(/[&\/\\#,+()$~%'":*?<>{}\[\]]/g, '-').replace(/\s+/g, '-').replace('---', '_')
        };
      });
    }
  }, {
    key: "fetchDataFromServer",
    value: function fetchDataFromServer() {
      var _this3 = this;

      var payload = new FormData();
      payload.append('old_filepath', this.state.fileInfo.asset_dir + this.state.fileInfo.filename);
      payload.append('new_filepath', this.state.newFileDir + this.state.newFileName);
      axios({
        method: "post",
        url: this.state.appAddress + "/move/",
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
          }, "Unable to move file from ", /*#__PURE__*/React.createElement("strong", {
            style: {
              wordBreak: "break-all"
            }
          }, payload.get('old_filepath')), " to ", /*#__PURE__*/React.createElement("strong", {
            style: {
              wordBreak: "break-all"
            }
          }, payload.get('new_filepath')), ":", /*#__PURE__*/React.createElement("br", null), error.response.data)
        });
      });
    }
  }, {
    key: "onFileDirChange",
    value: function onFileDirChange(event) {
      var newVal = event.target.value.replace('\n', '').replace('\r', '');

      if (newVal.endsWith('/')) {
        this.setState({
          responseMessage: null,
          disableSubmitByDirName: false
        });
      } else {
        this.setState({
          responseMessage: /*#__PURE__*/React.createElement("div", {
            className: "alert alert-warning mb-3",
            role: "alert",
            style: {
              wordBreak: "break-word"
            }
          }, "New directory ", /*#__PURE__*/React.createElement("strong", {
            style: {
              wordBreak: "break-all"
            }
          }, newVal), " does not end with a ", /*#__PURE__*/React.createElement("code", null, "/"), ". If submitted, the section after the last ", /*#__PURE__*/React.createElement("code", null, "/"), " will be interpreted as a part of the new filename by the server, which is usually not desired. To avoid the ambiguity, you need to append a ", /*#__PURE__*/React.createElement("code", null, "/"), " to the end of the directory to submit."),
          disableSubmitByDirName: true
        });
      }

      this.setState({
        newFileDir: newVal
      });
    }
  }, {
    key: "onFileNameChange",
    value: function onFileNameChange(event) {
      var newVal = event.target.value.replace('\n', '').replace('\r', '');

      if (newVal.includes('/')) {
        this.setState({
          responseMessage: /*#__PURE__*/React.createElement("div", {
            className: "alert alert-warning mb-3",
            role: "alert",
            style: {
              wordBreak: "break-word"
            }
          }, "New filename ", /*#__PURE__*/React.createElement("strong", {
            style: {
              wordBreak: "break-all"
            }
          }, newVal), " contains ", /*#__PURE__*/React.createElement("code", null, "/"), ", which will be interpreted as a separate directory by the server. To avoid ambiguity, this value cannot be submitted."),
          disableSubmitByFileName: true
        });
      } else {
        this.setState({
          responseMessage: null,
          disableSubmitByFileName: false
        });
      }

      this.setState({
        newFileName: newVal
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
        id: "exampleModal",
        role: "dialog",
        "aria-labelledby": "modal-move-file-title",
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
        id: "modal-move-file-title"
      }, "Move File")), /*#__PURE__*/React.createElement("div", {
        className: "modal-body"
      }, /*#__PURE__*/React.createElement("div", {
        className: "mb-3"
      }, /*#__PURE__*/React.createElement("label", {
        className: "form-label",
        style: {
          wordBreak: "break-word"
        }
      }, "Move the file from ", /*#__PURE__*/React.createElement("strong", {
        style: {
          wordBreak: "break-all"
        }
      }, this.state.fileInfo.asset_dir + this.state.fileInfo.filename), " to:"), /*#__PURE__*/React.createElement("div", {
        className: "input-group mb-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "input-group-text font-monospace"
      }, "Directory"), /*#__PURE__*/React.createElement("textarea", {
        type: "text",
        className: "form-control",
        rows: "2",
        style: {
          wordBreak: "break-all"
        },
        placeholder: "Input new filename",
        value: this.state.newFileDir,
        onChange: this.onFileDirChange
      })), /*#__PURE__*/React.createElement("div", {
        className: "input-group mb-3"
      }, /*#__PURE__*/React.createElement("span", {
        className: "input-group-text font-monospace"
      }, "Filename\xA0"), /*#__PURE__*/React.createElement("textarea", {
        type: "text",
        className: "form-control",
        rows: "2",
        style: {
          wordBreak: "break-all"
        },
        placeholder: "Input new filename",
        value: this.state.newFileName,
        onChange: this.onFileNameChange
      })), this.state.responseMessage, /*#__PURE__*/React.createElement("div", {
        className: "accordion my-2",
        id: "accordionMove"
      }, /*#__PURE__*/React.createElement("div", {
        className: "accordion-item"
      }, /*#__PURE__*/React.createElement("h2", {
        className: "accordion-header",
        id: "headingRemove"
      }, /*#__PURE__*/React.createElement("button", {
        className: "accordion-button collapsed",
        type: "button",
        "data-bs-toggle": "collapse",
        "data-bs-target": "#collapseMoveOne",
        "aria-expanded": "false",
        "aria-controls": "collapseMoveOne"
      }, "What's Happening Under the Hood?")), /*#__PURE__*/React.createElement("div", {
        id: "collapseMoveOne",
        className: "accordion-collapse collapse",
        "aria-labelledby": "headingRemove",
        "data-bs-parent": "#accordionMove"
      }, /*#__PURE__*/React.createElement("div", {
        className: "accordion-body"
      }, /*#__PURE__*/React.createElement("ol", null, /*#__PURE__*/React.createElement("li", null, "The server returns an error message if ", /*#__PURE__*/React.createElement("a", {
        href: "https://docs.python.org/3/library/os.path.html#os.path.ismount",
        target: "_blank"
      }, "os.path.ismount()"), " returns true;"), /*#__PURE__*/React.createElement("li", null, "The server calls ", /*#__PURE__*/React.createElement("a", {
        href: "https://docs.python.org/3/library/shutil.html#shutil.move",
        target: "_blank"
      }, "shutil.move()"), " to do the move;"), /*#__PURE__*/React.createElement("li", null, "If the destination is on a different filesystem, source file is copied to destination and then removed ", /*#__PURE__*/React.createElement("strong", null, "(It could take a long time!)"), ";"), /*#__PURE__*/React.createElement("li", null, "In case of symlinks, a new symlink pointing to the target of src will be created in or as dst and src will be removed."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("code", null, "Regularize Filename"), " is used to make a filename more machine-friendly: it converts all letters to lowercase, replaces each special character (including space) with a ", /*#__PURE__*/React.createElement("code", null, "-"), " and then replaces a ", /*#__PURE__*/React.createElement("code", null, "---"), " with a ", /*#__PURE__*/React.createElement("code", null, "_"))))))))), /*#__PURE__*/React.createElement("div", {
        className: "modal-footer"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-secondary",
        onClick: this.handleCloseClick
      }, "Close"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-primary",
        onClick: this.handleRegularizationClick
      }, "Regularize Filename"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn btn-primary",
        disabled: this.state.disableSubmitByFileName || this.state.disableSubmitByDirName || this.state.disableSubmitBySubmit,
        onClick: this.handleSubmitClick
      }, "OK")))));
    }
  }]);

  return ModalMove;
}(React.Component);

},{}]},{},[1]);
