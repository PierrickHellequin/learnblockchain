import React from "react";
import VotingContract from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";
import { Nav, Navbar } from "react-bootstrap";
import { HashRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import SaveList from "./Components/SaveList";
import CreatePropositions from "./Components/CreatePropositions";
import Vote from "./Components/Vote";
import Resultat from "./Components/resultats";

class App extends React.Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = await VotingContract.networks[networkId];

      const instance = new web3.eth.Contract(
        VotingContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runInit);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  runInit = async () => {
    const { contract } = this.state; // eslint-disable-line no-use-before-define

    // récupère l'état actuel du vote
    const workflowStatus = await contract.methods.actualStatus().call();
    console.log(workflowStatus);
    //const enumWorkflow = await contract.methods.WorkflowStatus().call();

    // Mettre à jour le state
    this.setState({ workflowStatus: workflowStatus });
  };

  showWorkflow(element) {
    let { workflowStatus } = this.state;
    let showWorkflow = true;

    switch (element) {
      case "Enregistrement":
        if (workflowStatus == 0) {
          showWorkflow = false;
        }
        break;
      case "Propositions":
        if (workflowStatus == 1) {
          showWorkflow = false;
        }
        break;
      case "Vote":
        if (workflowStatus == 3) {
          showWorkflow = false;
        }
        break;
      case "Resutats":
        if (workflowStatus == 5) {
          showWorkflow = false;
        }
        break;
      default:
        break;
    }
    return showWorkflow;
  }

  updateWorkflow = async () => {
    const { accounts, contract, workflowStatus } = this.state;
    let newStatus = parseInt(workflowStatus) + 1;
    console.log(newStatus);
    await contract.methods
      .changeWorkflow(newStatus)
      .send({ from: accounts[0] })
      .then((res) => {
        this.setState({ workflowStatus: newStatus });
      })
      .catch(function (err) {
        console.log(err);
      });
    //navigate('/testmerde');
    // this.setState({workflowStatus : newStatus});
  };

  buttonUpdateWorkflow() {
    return (
      <Navbar.Collapse className=" justify-content-end ">
        <Nav>
          <Nav.Link
            className="justify-content-end"
            onClick={() => {
              this.updateWorkflow();
            }}
          >
            Etape suivante
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    );
  }

  render() {
    const { workflowStatus, accounts, contract } = this.state;
    console.log(process.env.PUBLIC_URL);
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <HashRouter >
        <div>
          <Navbar expand="lg" bg="dark" variant="dark">
            <Navbar.Brand href="#">Système de vote</Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link
                to="/saveList"
                href="#/saveList"
                disabled={this.showWorkflow("Enregistrement")}
                className={!this.showWorkflow("Enregistrement") ? "active" : ""}
              >
                Enregistrement
              </Nav.Link>

              <Nav.Link
                eventKey="link-1"
                to="/proposition"
                href="#/proposition"
                disabled={this.showWorkflow("Propositions")}
                className={!this.showWorkflow("Propositions") ? "active" : ""}
              >
                Propositions
              </Nav.Link>

              <Nav.Link
                href="#/vote"
                to="/vote"
                eventKey="link-2"
                disabled={this.showWorkflow("Vote")}
                className={!this.showWorkflow("Vote") ? "active" : ""}
              >
                Vote
              </Nav.Link>

              <Nav.Link
                href="#/resultats"
                eventKey="link-3"
                to="/resultat"
                disabled={this.showWorkflow("Resutats")}
                className={!this.showWorkflow("Resutats") ? "active" : ""}
              >
                Résutats
              </Nav.Link>
            </Nav>
            <Navbar.Toggle />

            {workflowStatus < 5 ? this.buttonUpdateWorkflow() : ""}
          </Navbar>

          <div>
            <Routes>
              <Route
                path="/saveList"
                exact
                element={<SaveList accounts={accounts} contract={contract} />}
              />
              <Route
                path="/proposition"
                exact
                element={
                  <CreatePropositions accounts={accounts} contract={contract} />
                }
              />
              <Route
                path="/vote"
                exact
                element={<Vote accounts={accounts} contract={contract} />}
              />
              <Route
                path="/resultats"
                exact
                element={<Resultat accounts={accounts} contract={contract} />}
              />
            </Routes>
          </div>
        </div>
      </HashRouter>
    );
  }
}

export default App;
