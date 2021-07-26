import React, { Component } from "react";
import BettingGameContract from "./contracts/BettingGame.json";
import getWeb3 from "./getWeb3";
import Loading from './Loading'
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3'

import "./App.css";

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
  }

  async loadWeb3() {
    if(typeof window.ethereum!=='undefined' && !this.state.wrongNetwork){
      let accounts, network, balance, web3, maxBet, minBet, contract, contract_abi, contract_address

      //don't refresh DApp when user change the network
      window.ethereum.autoRefreshOnNetworkChange = false;

      web3 = new Web3(window.ethereum)
      this.setState({web3: web3})

      // Use web3 to get the user's accounts.
      accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      contract_address = BettingGameContract.networks[networkId].address;
      contract = new web3.eth.Contract(
        BettingGameContract.abi,
        contract_address,
      );

      //Update the data when user initially connect
      if(typeof accounts[0]!=='undefined' && accounts[0]!==null) {
        balance = await web3.eth.getBalance(accounts[0])
        maxBet = await web3.eth.getBalance(contract_address)
        minBet = await contract.methods.weiInUsd().call()
        this.setState({account: accounts[0], balance: balance, minBet: minBet, maxBet: maxBet})
      }

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ contract: contract,  contractAddress: contract_address });

      window.ethereum.on('accountsChanged', async (accounts) => {
        if(typeof accounts[0] !== 'undefined'  && accounts[0]!==null){
          balance = await web3.eth.getBalance(accounts[0])
          maxBet = await web3.eth.getBalance(contract_address)
          minBet = await contract.methods.weiInUsd().call()
          
          this.setState({account: accounts[0], balance: balance, minBet: minBet, maxBet: maxBet})
        } else {
          this.setState({account: null, balance: 0})
        }
      });

      window.ethereum.on('chainChanged', async (chainId) => {
        network = parseInt(chainId, 16)
        if(network!==4){
          this.setState({wrongNetwork: true})
        } else {
          if(this.state.account){
            balance = await this.state.web3.eth.getBalance(this.state.account)
            maxBet = await this.state.web3.eth.getBalance(this.state.contractAddress)
            minBet = await this.state.contract.methods.weiInUsd().call()
            
            this.setState({ balance: balance, maxBet: maxBet, minBet: minBet })
          }
          this.setState({ network: network, loading: false, onlyNetwork: false, wrongNetwork: false})
        }
      });
    }
  };

  async makeBet(bet, amount) {
    const networkId = await this.state.web3.eth.net.getId();
    if(networkId != 4) {
      this.setState({ wrongNetwork: true });
    } else if(typeof this.state.account !=='undefined' && this.state.account !==null) {
      var randomSeed = Math.floor(Math.random() * Math.floor(1e9))

      this.state.contract.methods.game(bet, randomSeed).send({ from: this.state.account, value: amount }).on('transactionHash', (hash) => {
        this.setState({ loading: true })
        this.state.contract.events.Result({}, async (error, event) => {
          const verdict = event.returnValues.winAmount
          if(verdict === '0') {
            window.alert('lose :(')
          } else {
            window.alert('WIN!')
          }
          //Prevent error when user logout, while waiting for the verdict
          if(this.state.account!==null && typeof this.state.account!=='undefined'){
            const balance = await this.state.web3.eth.getBalance(this.state.account)
            const maxBet = await this.state.web3.eth.getBalance(this.state.contractAddress)
            this.setState({ balance: balance, maxBet: maxBet })
          }
          this.setState({ loading: false })
        })
      }).on('error', (error) => {
        window.alert('Error')
      })
    } else {
      window.alert('Problem with account or network')
    }
  }

  onChange(value) {
    this.setState({'amount': value});
  }

  constructor(props) {
    super(props)
    this.state = {
      account: null,
      amount: null,
      balance: null,
      contract: null,
      event: null,
      loading: false,
      network: null,
      maxBet: 0,
      minBet: 0,
      web3: null,
      wrongNetwork: false,
      contractAddress: null
    }

    this.makeBet = this.makeBet.bind(this)
    this.setState = this.setState.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account}/>&nbsp;
        {this.state.wrongNetwork
          ? <div className="container-fluid mt-5 text-monospace text-center mr-auto ml-auto">
              <div className="content mr-auto ml-auto">
                <h1>Please Enter Rinkeby Network</h1>
              </div>
            </div>
          : this.state.loading 
              ? <Loading
                  balance={this.state.balance}
                  maxBet={this.state.maxBet}
                  minBet={this.state.minBet}
                  web3={this.state.web3}
                />
              : <Main
                  amount={this.state.amount}
                  balance={this.state.balance}
                  makeBet={this.makeBet}
                  onChange={this.onChange}
                  maxBet={this.state.maxBet}
                  minBet={this.state.minBet}
                  loading={this.state.loading}
                  web3={this.state.web3}
                />
        }
      </div>
    );
  }
}

export default App;
