import React, { Component } from 'react';
import Web3 from 'web3'
import logo from '../logo.png';
import './App.css';
import Medical from '../abis/Medical.json'
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
  const web3 = window.web3
  // Load account
  const accounts = await web3.eth.getAccounts()
  this.setState({ account: accounts[0] })
  const networkId = await web3.eth.net.getId()
  const networkData = Medical.networks[networkId]
  if(networkData) {
    const medical = web3.eth.Contract(Medical.abi, networkData.address)
    this.setState({ medical })
    const patCount = await medical.methods.patCount().call()
    //console.log(patCount.toString())
   
  //const productCount = await Marketplace.methods.productCount().call()    
    this.setState({ patCount })

    // Load products
          for (var i = 1; i <= patCount; i++)
          {
              const details = await medical.methods.patient(i).call()
              this.setState({
              patient: [...this.state.patient, details]
              })
          }
          
          console.log(this.state.products )

          this.setState({ loading: false})  

  }
  else {
    window.alert('Marketplace contract not deployed to detected network.')
  }
   
}
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      patCount: 0,
      patient: [],
      loading: true
    }
    this.addMedicine = this.addMedicine.bind(this)
    this.purchaseMedicine = this.purchaseMedicine.bind(this)
  }
addMedicine(pat_name, medi_name, price) {
this.setState({ loading: true })
this.state.medical.methods.addMedicine(pat_name, medi_name, price).send({ from: this.state.account })
.once('receipt', (receipt) => {
  this.setState({ loading: false })
})
}
purchaseMedicine(id, price) {
  this.setState({ loading: true })
  this.state.medical.methods.purchaseMedicine(id).send({ from: this.state.account, value: price })
  .once('receipt', (receipt) => {
    this.setState({ loading: false })
  })
}
render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <Main
                  patient={this.state.patient}
                  addMedicine={this.addMedicine}
                  purchaseMedicine={this.purchaseMedicine} />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
