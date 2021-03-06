// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
//Permet d'enregistrer les ERC721
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; 
import "@openzeppelin/contracts/utils/Counters.sol";

contract GameItem is ERC721URIStorage{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
 
    constructor() ERC721("GameItem", "ITM") {}
 
    function addItem(address player, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();
    
        uint256 newItemId = _tokenIds.current();
        //création nouveau token et affecter au player
        _mint(player, newItemId);
        //affectation tojenUri au nouveau ID
        _setTokenURI(newItemId, tokenURI);
 
        return newItemId;
    }
}