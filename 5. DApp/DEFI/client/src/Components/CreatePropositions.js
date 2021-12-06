import React from "react";
import { Card, Form, Button, ListGroup, Table } from "react-bootstrap";

class CreatePropositions extends React.Component {
  constructor(props) {
    super(props);
    this.state = { contract: null, proposals: [] };
    // récupère la liste des comptes autorisés
  }


  updateData = async() => {
    const { contract } = this.props; // eslint-disable-line no-use-before-define
    const proposals = await contract.methods.getProposals().call();
    console.log(proposals);
    //proposals == undefined ? [] : proposals;
    console.log(proposals);
    // Mettre à jour le state
    this.setState({ proposals: proposals, contract: contract });
  }
  //registeredProposal
  createPropositions = async () => {
    const { accounts, contract } = this.props;
    const proposals = this.proposals.value;

    // Interaction avec le smart contract pour ajouter un compte
    await contract.methods
      .registeredProposal(proposals)
      .send({ from: accounts[0] })
      .then((res) => {
        console.log(res);
        this.updateData();
      })
      .catch(function (err) {
        console.log(err);
      });
    // Récupérer la liste des comptes autorisé
    // Mettre à jour le state
    this.setState({ contract: contract });
  };

  componentDidUpdate(prevProps, prevState) {
    let { proposals } = this.state;

    if(proposals == undefined){
        proposals = [];
    }

    if (proposals.length == 0 && prevState.contract !== prevProps.contract) {
      this.updateData();
    }
  }

  render() {
        const {proposals} = this.state;
        console.log(proposals);
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
                    <strong>Enregistrer proposition</strong>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group >
                      <Form.Control
                        type="text"
                        id="proposals"
                        ref={(input) => {
                          this.proposals = input;
                        }}
                      />
                    </Form.Group>
                    <Button onClick={this.createPropositions} variant="dark">
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
                    <strong>Liste des propositions</strong>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <Table striped bordered hover>
                            <thead>
                        <tr>
                          <th>.</th>
                        </tr>
                      </thead>
                          <tbody>
                            {proposals !== undefined &&
                              proposals.map((a) => (
                                <tr key={a}>
                                  <td>{a.description}</td>
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

export default CreatePropositions;