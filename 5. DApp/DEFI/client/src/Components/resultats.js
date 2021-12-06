import React from "react";
import { Card, Alert, ListGroup, Badge } from "react-bootstrap";

class resultats extends React.Component {
  constructor(props) {
    super(props);
    this.state = { contract: null, winner: [] };
    // récupère la liste des comptes autorisés
  }

  updateData = async () => {
    const { contract } = this.props; // eslint-disable-line no-use-before-define
    const winner = await contract.methods.getWinningProposals().call();
    console.log(winner);
    //proposals == undefined ? [] : proposals;
    console.log(winner);
    // Mettre à jour le state
    this.setState({ winner: winner, contract: contract });
  };
  //registeredProposal

  componentDidUpdate(prevProps, prevState) {
    let { proposals } = this.state;

    if (proposals == undefined) {
      proposals = [];
    }

    if (proposals.length == 0 && prevState.contract !== prevProps.contract) {
      this.updateData();
    }
  }

  render() {
    const { winner } = this.state;
    console.log(winner);
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
                <strong>Proposition gagnante :</strong>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Alert variant="primary">
                        <span><Badge className="bg-danger">{winner.voteCount} </Badge></span>

                        <span>  {winner.description}</span>
                    </Alert>
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

export default resultats;
