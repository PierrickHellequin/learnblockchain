import React, { Component } from "react";
import getWeb3 from "../getWeb3";
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";

class SwapVue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      output: "0",
      loading: true,
      currentForm: "buy",
    };
  }

  render() {
    let content;
    if (this.state.currentForm === "buy") {
      content = (
        <BuyForm
          ethBalance={this.props.ethBalance}
          tokenBalance={this.props.tokenBalance}
          buyTokens={this.props.buyTokens}
        />
      );
    } else {
      content = (
        <SellForm
          ethBalance={this.props.ethBalance}
          tokenBalance={this.props.tokenBalance}
          sellTokens={this.props.sellTokens}
        />
      );
    }
    return (
      <div id="content" className="mt-3 ">
        <div className=" justify-content-between mb-3">
          <button
            className="btn btn-light"
            onClick={(event) => {
              this.setState({ currentForm: "buy" });
            }}
          >
            Buy
          </button>
          <span className="text-muted">&lt; &nbsp; &gt;</span>
          <button
            className="btn btn-light"
            onClick={(event) => {
              this.setState({ currentForm: "sell" });
            }}
          >
            Sell
          </button>
        </div>

        <div
          className="card mb-4"
          style={{
            width: "40%",
          }}
        >
          <div className="card-body">{content}</div>
        </div>
      </div>
    );
  }
}

export default SwapVue;
