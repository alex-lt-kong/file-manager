import Offcanvas from 'react-bootstrap/Offcanvas';
import React from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

class OffcanvasPreferences extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.show,
      thumbnailSize: props.thumbnailSize,
      filesPerRowIndex: props.filesPerRowIndex
    };
    this.handleClose = this.handleClose.bind(this);
    this.onThumbnailSizeChanged = this.onThumbnailSizeChanged.bind(this);
    this.onFilesPerRowIndexChanged = this.onFilesPerRowIndexChanged.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.thumbnailSize !== this.props.thumbnailSize) {
      this.setState({
        thumbnailSize: this.props.thumbnailSize
      });
    }
  }

  onThumbnailSizeChanged(event) {
    const parsedValue = parseInt(event.target.value);
    if (isNaN(parsedValue)) {
      return;
    }
    if (parsedValue === this.state.thumbnailSize || parsedValue < 1 || parsedValue > 12) {
      return;
    }
    this.setState({
      thumbnailSize: parsedValue
    }, ()=> {
      localStorage.setItem('thumbnailSize', parsedValue);
      this.props.updateThumbnailSize(parsedValue);
    });
  }

  onFilesPerRowIndexChanged(event) {
    console.log(`onFilesPerRowIndexChanged(event) fired!`);
    const parsedValue = parseInt(event.target.value);
    if (isNaN(parsedValue)) {
      console.error(`isNan(${event.target.value}) === true`);
      return;
    }
    if (parsedValue === this.state.filesPerRowIndex || parsedValue < 0 || parsedValue > 5) {
      return;
    }
    this.setState({
      filesPerRowIndex: parsedValue
    }, ()=> {
      localStorage.setItem('filesPerRowIndex', parsedValue);
      this.props.updateFilesPerRowIndex(parsedValue);
    });
  }

  handleClose() {
    this.setState({
      show: false
    });
  }

  render() {
    return (
      <Offcanvas show={this.state.show} onHide={this.handleClose} placement="bottom">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Preferences</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{fontSize: '0.85em'}}>
          <Container style={{maxSize: '1280px'}}>
            <Form.Group as={Row} style={{maxWidth: '1280px'}}>
              <Form.Label column sm={2}>Thumbnail Size</Form.Label>
              <Col sm={10}>
                <Form.Range value={this.state.thumbnailSize}
                  onChange={this.onThumbnailSizeChanged} min={1} max={12}/>
              </Col>
              <Form.Label column sm={2}>Files per row</Form.Label>
              <Col sm={10}>
                <Form.Range value={this.state.filesPerRowIndex}
                  onChange={this.onFilesPerRowIndexChanged} min={0} max={5}/>
              </Col>
            </Form.Group>
          </Container>
        </Offcanvas.Body>
      </Offcanvas>
    );
  }
}

OffcanvasPreferences.propTypes = {
  show: PropTypes.bool,
  thumbnailSize: PropTypes.number,
  filesPerRowIndex: PropTypes.number,
  updateThumbnailSize: PropTypes.func,
  updateFilesPerRowIndex: PropTypes.func
};

export {OffcanvasPreferences};
