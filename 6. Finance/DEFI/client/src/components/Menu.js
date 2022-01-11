import React, { Component } from "react";
import Identicon from "identicon.js";
import { Nav, Navbar, Container } from "react-bootstrap";

class Menu extends Component {
  render() {
    return (
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">Dex</Navbar.Brand>

          <Nav className="me-auto">
            <Nav.Link href="#home">Stacking</Nav.Link>
            <Nav.Link href="#features">Swap</Nav.Link>
          </Nav>
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
            {this.props.account[0]} &nbsp; 
            {this.props.account[0] ? (
                <img
                  className="ml-2"
                  width="30"
                  height="30"
                  src={`data:image/png;base64,${new Identicon(
                    this.props.account[0],
                    30
                  ).toString()}`}
                  alt=""
                />
              ) : (
                <span></span>
              )}
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default Menu;
