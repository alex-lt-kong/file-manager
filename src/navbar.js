import React from 'react';
import PropTypes from 'prop-types';
import {ModalMkdir} from './modal/mkdir.js';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import {OffcanvasServerInfo} from './offcanvas/server-info.js';
import {OffcanvasFileUpload} from './offcanvas/upload';


class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPath: props.currentPath,
      addressBar: props.currentPath,
      onFileItemClicked: props.onFileItemClicked,
      modalDialogue: null,
      offcanvasElement: null
    };
    this.onNewFolderClick = this.onNewFolderClick.bind(this);
    this.onServerInfoClick = this.onServerInfoClick.bind(this);
    this.onUploadFileClicked = this.onUploadFileClicked.bind(this);
    this.onClickAddressBarGo = this.onClickAddressBarGo.bind(this);
    this.onAddressBarEnterPress = this.onAddressBarEnterPress.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentPath !== this.props.currentPath) {
      this.setState({
        currentPath: this.props.currentPath,
        addressBar: this.props.currentPath
      });
    }
  }

  onAddressBarEnterPress(event) {
    if (event.key !== 'Enter') {
      return;
    }
    this.setState({
      currentPath: this.state.addressBar
    }, ()=>{
      this.props.refreshFileList();
    });
  }

  onClickAddressBarGo(event) {
    this.setState({
      currentPath: this.state.addressBar
    }, ()=>{
      this.props.refreshFileList();
    });
  }

  onServerInfoClick(event) {
    this.setState({
      offcanvasElement: null
    }, ()=> {
      this.setState({
        offcanvasElement: (
          <OffcanvasServerInfo show={true}/>
        )
      });
    });
  }

  onUploadFileClicked() {
    this.setState({
      offcanvasElement: null
    }, ()=> {
      this.setState({
        offcanvasElement: (
          <OffcanvasFileUpload show={true} currentPath={this.state.currentPath}/>
        )
      });
    });
  }

  onNewFolderClick(event) {
    this.setState({
      modalDialogue: null
    }, () => {
      this.setState({
        modalDialogue: (
          <ModalMkdir assetDir={this.state.currentPath} refreshFileList={this.props.refreshFileList} show={true} />
        )
      });
    });
  }

  render() {
    return (
      <>
        {this.state.offcanvasElement}
        <Navbar bg="light" variant="light">
          <Container>
            {this.state.modalDialogue}
            <Row className="container-fluid">
              <Col md="auto">
                {/* Use col-{breakpoint}-auto classes to size columns based on the natural width of their content. */}
                <Dropdown>
                  <Dropdown.Toggle variant="primary" id="dropdown-basic">
                    Menu
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={this.onUploadFileClicked}>
                      <i className="bi bi-upload"></i>  Upload File
                    </Dropdown.Item>
                    <Dropdown.Item onClick={this.onNewFolderClick}>
                      <i className="bi bi-folder-plus"></i>  Create Folder
                    </Dropdown.Item>
                    <Dropdown.Item onClick={this.onServerInfoClick}>
                      <i className="bi bi-gear"></i>  Server Info
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              <Col>
                <div className="input-group d-flex justify-content-between mx-1 my-1">
                  {/* d-flex and justify-content-between keep components in one line*/}
                  <span className="input-group-text" id="basic-addon1"></span>
                  <input type="text" className="form-control" placeholder="Address"
                    aria-label="Recipient's username" aria-describedby="button-addon2"
                    value={this.state.addressBar} onChange={this.onAddressBarChange}
                    onKeyPress={this.onAddressBarEnterPress} id="address-input" />
                  <button className="btn btn-primary" type="button"
                    onClick={this.onClickAddressBarGo} htmlFor="address-input" >
                    <i className="bi bi-caret-right-fill"></i>
                  </button>
                </div>
              </Col>
            </Row>
          </Container>
        </Navbar>
      </>
    );
  }
}

NavigationBar.propTypes = {
  onFileItemClicked: PropTypes.func,
  refreshFileList: PropTypes.func,
  currentPath: PropTypes.string
};

export {NavigationBar};
