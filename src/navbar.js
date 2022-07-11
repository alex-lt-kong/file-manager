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
import {OffcanvasPreferences} from './offcanvas/preferences';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';

class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPath: props.currentPath,
      addressBarValue: props.currentPath,
      updateThumbnailSize: props.updateThumbnailSize,
      onFileItemClicked: props.onFileItemClicked,
      modalDialogue: null,
      offcanvasElement: null
    };
    this.onNewFolderClick = this.onNewFolderClick.bind(this);
    this.onServerInfoClick = this.onServerInfoClick.bind(this);
    this.onPreferencesClick = this.onPreferencesClick.bind(this);
    //this.updateThumbnailSize = this.updateThumbnailSize.bind(this);
    this.onUploadFileClicked = this.onUploadFileClicked.bind(this);
    this.onClickAddressBarGo = this.onClickAddressBarGo.bind(this);
    this.onAddressBarEnterPress = this.onAddressBarEnterPress.bind(this);
    this.onAddressBarChange = this.onAddressBarChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentPath !== this.props.currentPath) {
      this.setState({
        currentPath: this.props.currentPath,
        addressBarValue: this.props.currentPath
      });
    }
  }

  onAddressBarEnterPress(event) {
    if (event.key !== 'Enter') {
      return;
    }
    this.setState({
      currentPath: this.state.addressBarValue
    }, ()=>{
      this.props.refreshFileList();
    });
  }

  onClickAddressBarGo(event) {
    this.setState({
      currentPath: this.state.addressBarValue
    }, ()=>{
      this.props.refreshFileList(this.state.currentPath);
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

  onPreferencesClick(event) {
    this.setState({
      offcanvasElement: null
    }, ()=> {
      this.setState({
        offcanvasElement: (
          <OffcanvasPreferences show={true} updateThumbnailSize={this.state.updateThumbnailSize}
            thumbnailSize={this.state.thumbnailSize} />
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

  onAddressBarChange(event) {
    this.setState({
      addressBarValue: event.target.value
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
            <Row className="container-fluid pe-3" style={{maxWidth: '1680px'}}>
              <Col>
                <InputGroup>
                  <Form.Control type="text" placeholder="Address" value={this.state.addressBarValue}
                    onChange={this.onAddressBarChange} onKeyPress={this.onAddressBarEnterPress} />
                  <Button onClick={this.onClickAddressBarGo} ><i className="bi bi-caret-right-fill"></i></Button>
                </InputGroup>
              </Col>
              <Col xs="auto" className="px-0">
                <Dropdown align="end">
                  <Dropdown.Toggle variant="primary">
                    <i className="bi bi-list"></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={this.onUploadFileClicked}>
                      <i className="bi bi-upload"></i>  Upload File
                    </Dropdown.Item>
                    <Dropdown.Item onClick={this.onNewFolderClick}>
                      <i className="bi bi-folder-plus"></i>  Create Folder
                    </Dropdown.Item>
                    <Dropdown.Item onClick={this.onPreferencesClick}>
                      <i className="bi bi-sliders"></i>  Preferences
                    </Dropdown.Item>
                    <Dropdown.Item onClick={this.onServerInfoClick}>
                      <i className="bi bi-info-circle"></i>  Server Info
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>
          </Container>
          {this.state.modalDialogue}
        </Navbar>
      </>
    );
  }
}

NavigationBar.propTypes = {
  onFileItemClicked: PropTypes.func,
  refreshFileList: PropTypes.func,
  currentPath: PropTypes.string,
  updateThumbnailSize: PropTypes.func
};

export {NavigationBar};
