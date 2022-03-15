require('dotenv').config();
const pinataSDK = require("@pinata/sdk");
const fs = require("fs");

const key = process.env.PINATA_KEY;
const secret = process.env.PINATA_SECRET;
const pinata = pinataSDK(key, secret);
const readableStreamForFile = fs.createReadStream("samourai.jpg");

const options = {
    pinataMetadata: {
        name: "AlyraNFT",
    },
    pinataOptions: {
        cidVersion: 0
    }
};

pinata.pinFileToIPFS(readableStreamForFile, options).then((result) => {
    const body = {
        description: "Samourai NFT",
        image: result.IpfsHash,
        name: "Le découpeur de crypto",
        pouvoir: "samourai"
    };

    pinata.pinJSONToIPFS(body, options).then((json) => {
        console.log(json);
    }).catch((err) => {
        console.log(err);
    })
}).catch((err) => {
    console.log(err);
})