import React from "react";
import { Card, Form, Button, ListGroup, Table } from "react-bootstrap";

class SaveList extends React.Component {
    
  constructor(props) {
    super(props);
    this.state = { contract: null, whitelist: [] };
    // récupère la liste des comptes autorisés
  }

  updateData = async() => {
    const { contract } = this.props; // eslint-disable-line no-use-before-define

    // récupère l'état actuel du vote
    //const workflowStatus = await contract.methods.actualStatus().call();
    // récupère la liste des comptes autorisés
    const whitelist = await contract.methods.getTheWhiteListed().call();
    // Mettre à jour le state
    this.setState({ whitelist: whitelist, contract: contract });
  }

  whitelist = async () => {
    const { accounts, contract } = this.props;
    const address = this.address.value;

    // Interaction avec le smart contract pour ajouter un compte
    await contract.methods.whitelist(address)
      .send({ from: accounts[0] })
      .then((res) => {
        console.log(res);
        this.updateData();
      })
      .catch(function (err) {
        console.log(err);
      });
    // Récupérer la liste des comptes autorisés
  };

  componentDidUpdate(prevProps, prevState) {
      const {whitelist} = this.state;

      if(whitelist.length == 0 && prevState.contract !== prevProps.contract){
       this.updateData();
      }
    
  }

  render() {
    const {whitelist} = this.state;
    return (
      <React.Fragment>
        <div>
          <div>
            <br></br>
            <h2 className="text-center">Système d'une liste blanche</h2>
            <br></br>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Card style={{ width: "50rem" }}>
              <Card.Header>
                <strong>Autoriser un nouveau compte</strong>
              </Card.Header>
              <Card.Body>
                <Form.Group >
                  <Form.Control
                    type="text"
                    id="address"
                    ref={(input) => {
                      this.address = input;
                    }}
                  />
                </Form.Group>
                <Button onClick={this.whitelist} variant="dark">
                  {" "}
                  Autoriser{" "}
                </Button>
              </Card.Body>
            </Card>
          </div>
          <br></br>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Card style={{ width: "50rem" }}>
              <Card.Header>
                <strong>Liste des comptes autorisés</strong>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>@</th>
                        </tr>
                      </thead>
                      <tbody>
                        {whitelist !== undefined &&
                          whitelist.map((a) => (
                            <tr key={a}>
                              <td>{a}</td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default SaveList;
