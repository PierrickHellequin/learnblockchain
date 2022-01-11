import React, { Component } from "react";
import web3 from "web3";
import getWeb3 from "./getWeb3";
import Stakeable from "./contracts/Stakeable.json";
import EmpireToken from "./contracts/EmpireToken.json";
import Swap from "./contracts/Swap.json";
import Menu from "./components/Menu";
import Main from "./components/Main";
import SwapVue from "./components/SwapVue";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: "",
      ethBalance: "0",
      instanceSwap: {},
      instanceToken: {},
      EmpireTokenBalance: "0",
      daiTokenBalance: "0",
      empireTokenReward: "0",
      stakingBalance: "0",
      loading: true,
    };
  }

  componentWillMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = await Stakeable.networks[networkId];

      const instance = new web3.eth.Contract(
        Stakeable.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      const ethBalance = await web3.eth.getBalance(accounts[0]);

      const deployedNetworkToken = await EmpireToken.networks[networkId];
      const instanceToken = new web3.eth.Contract(
        EmpireToken.abi,
        deployedNetworkToken && deployedNetworkToken.address
      );

      let tokenBalance = await instanceToken.methods
        .balanceOf(accounts[0])
        .call();

      const deployedNetworkSwap = await Swap.networks[networkId];
      const instanceSwap = new web3.eth.Contract(
        Swap.abi,
        deployedNetworkSwap && deployedNetworkSwap.address
      );

      this.setState(
        {
          instanceToken,
          instanceSwap,
          web3,
          accounts,
          ethBalance,
          EmpireTokenBalance: tokenBalance.toString(),
          contract: instance,
          loading: false,
        },
        this.infosStaker
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  infosStaker = async () => {
    const { accounts, contract, workflowStatus } = this.state;

    await contract.methods
      .hasStake(accounts[0])
      .call()
      .then((res) => {
        console.log(res);
        this.setState({ stakingBalance: res.total_amount, empireTokenReward: res.stakes[0].claimable });
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  stakeTokens = async (amount) => {
    const { accounts, contract } = this.state;

    await contract.methods
      .stake()
      .send({ value: amount, from: accounts[0] })
      .then((res) => {
        console.log(res);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  unstakeTokens = async (amount) => {
    const { accounts, contract, stakingBalance } = this.state;
    
    await contract.methods
      .withdrawStake(stakingBalance)
      .send({ from: accounts[0] })
      .then((res) => {
        console.log(res);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  buyTokens = (etherAmount) => {
    this.setState({ loading: true });
    this.state.instanceSwap.methods
      .buyTokens()
      .send({ from: this.state.accounts[0], value: etherAmount })
      .then((res) => {
        console.log(res);

        this.setState({ loading: false });
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true });
    console.log(this.state.instanceSwap._address);
    this.state.instanceToken.methods
      .approve(this.state.instanceSwap._address, tokenAmount)
      .send({ from: this.state.accounts[0] })
      .then((res) => {
        this.state.instanceSwap.methods
          .sellTokens(tokenAmount)
          .send({ from: this.state.accounts[0] })
          .then((res) => {
            this.setState({ loading: false });
          })
          .catch(function (err) {
            console.log(err);
          });
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  render() {
    let content;
    if (this.state.loading) {
      content = (
        <p id="loader" className="text-center">
          Loading...
        </p>
      );
    } else {
      content = (
        <Main
          ethBalance={this.state.ethBalance}
          empireTokenReward={this.state.empireTokenReward}
          stakingBalance={this.state.stakingBalance}
          stakeTokens={this.stakeTokens}
          unstakeTokens={this.unstakeTokens}
        />
      );
    }

    return (
      <div>
        <Menu
          account={this.state.accounts}
          ethBalance={this.state.ethBalance}
        />
        <div className="container-fluid ">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "600px" }}
            >
              <div className="content mr-auto ml-auto">
                <a target="_blank" rel="noopener noreferrer"></a>

                {content}
              </div>
            </main>
          </div>
          <div className="row">
            {this.state.loading ? (
              <p id="loader" className="text-center">
                Loading...
              </p>
            ) : (
              <SwapVue
                ethBalance={this.state.ethBalance}
                tokenBalance={this.state.EmpireTokenBalance}
                account={this.state.accounts[0]}
                buyTokens={this.buyTokens}
                sellTokens={this.sellTokens}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
