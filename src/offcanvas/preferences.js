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
      updateThumbnailSize: props.updateThumbnailSize
    };
    this.handleClose = this.handleClose.bind(this);
    this.onThumbnailSizeChanged = this.onThumbnailSizeChanged.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.thumbnailSize !== this.props.thumbnailSize) {
      this.setState({
        thumbnailSize: this.props.thumbnailSize
      });
    }
  }

  onThumbnailSizeChanged(event) {
    console.log(`onThumbnailSizeChanged(): ${event.target.value}`);
    console.log(this.state.updateThumbnailSize);
    this.state.updateThumbnailSize(event.target.value);
    this.setState({
      thumbnailSize: event.target.value
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
          <Container>
            <Form.Group as={Row} style={{maxWidth: '1280px'}}>
              <Form.Label column sm={2}>Thumbnail Size</Form.Label>
              <Col sm={10}>
                <Form.Control type="number" placeholder="Thumbnail size" value={this.state.thumbnailSize}
                  onChange={this.onThumbnailSizeChanged} />
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
  updateThumbnailSize: PropTypes.func
};

export {OffcanvasPreferences};
