import Web3 from "web3";
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/f81a2ad2a69a4a798c0af0d6b5069a7e"));
web3.eth.getBalance("0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c", function(err, result){
    if (err) console.log(err);
    else console.log(web3.utils.fromWei(result, "ether") + "ETH");
});;
