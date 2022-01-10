// FlashLoans.sol
pragma solidity ^0.6.6;

//le code importer d’AAVE est toujours en version ^0.6.6. Il est donc impossible pour nous de mettre notre contract dans la dernière version de solidity
//Il est aussi incompatible avec ses propres import d'openzeppelin... Il ne compile plus.
 
import "https://github.com/aave/flashloan-box/blob/Remix/contracts/aave/FlashLoanReceiverBase.sol";
import "https://github.com/aave/flashloan-box/blob/Remix/contracts/aave/ILendingPoolAddressesProvider.sol";
import "https://github.com/aave/flashloan-box/blob/Remix/contracts/aave/ILendingPool.sol";
 
 
contract FlashLoans is FlashLoanReceiverBase {
   ILendingPoolAddressesProvider provider;
   address dai;
  
   constructor(
       address _provider,
       address _dai)
       FlashLoanReceiverBase(_provider)
       public {
       provider = ILendingPoolAddressesProvider(_provider);
       dai = _dai;
   }

    function flashLoan(uint amount, bytes calldata _params) external {
       // Obtenir un pool de prêts
       ILendingPool lendingPool = ILendingPool(provider.getLendingPool()); 
       // Initialisation du flash loan, en précisant le smart contract qui recevra    le prêt address(this)
       // l'adresse du jeton que vous voulez emprunter et le montant (dai)
       // montant à emprunter (amount)
       lendingPool.flashLoan(address(this), dai, amount, _params);
    }

    function executeOperation(
       address _reserve,
       uint _amount,
       uint _fee,
       bytes memory _params
    ) override external {
       require(_amount <= getBalanceInternal(address(this), _reserve), "Invalid balance, was the flashLoan successful?");
 
       // La logique du code ! Vous pouvez effectuer : arbitrage, refinance loan, change collateral of loan
    }

    function executeOperation(
       address _reserve,
       uint _amount,
       uint _fee,
       bytes memory _params
    ) override external {
       require(_amount <= getBalanceInternal(address(this), _reserve), "Invalid balance, was the flashLoan successful?");
 
       // effectuer des instructions comme : arbitrage, refinance loan, change collateral of loan
      
       uint totalDebt = _amount.add(_fee);
      // remboursement du prêt 
       transferFundsBackToPoolInternal(_reserve, totalDebt); 
    }

}
