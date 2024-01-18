const express = require('express');
const { ethers } = require('ethers');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package

const { Network, Alchemy } = require('alchemy-sdk');

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3050;



// Define the CORS options
const corsOptions = {
  credentials: true,
  origin: ['https://www.thumbssss.com/', 'http://localhost:80'] // Whitelist the domains you want to allow
};

app.use(cors(corsOptions)); // Use the cors middleware with your options



const settings = {
  apiKey: process.env.API_KEY,
  network: Network.MATIC_MAINNET,
};


const alchemy = new Alchemy(settings);

require('dotenv').config();

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const STAKING_ADDRESS = process.env.STAKING_ADDRESS;

const thumbsContractABI = require('./artifacts/contracts/Thumbs.sol/Thumbs.json').abi;
const stakingContractABI = require('./artifacts/contracts/Thumbs.sol/StakingERC721.v1.json').abi;

const alchemyProvider = new ethers.providers.JsonRpcProvider(API_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);
const ThumbsContract = new ethers.Contract(CONTRACT_ADDRESS, thumbsContractABI, signer);
const StakingContract = new ethers.Contract(STAKING_ADDRESS, stakingContractABI, signer);

app.get('/', async (req, res) => {
    return res.status(200).json({ message: 'Welcome to the New Thumbs Blockchain API' });
});

app.post('/getNftsForOwner', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const nft = await alchemy.nft.getNftsForOwner(walletAddress);
    
    // const meta = await alchemy.nft.getNftMetadata('0xdf6a44c29c0e78577245c12439d0cc6070f3e250');
    
    // if (!nftsResponse || !Array.isArray(nftsResponse.ownedNfts)) {
    //     return res.status(500).json({ error: 'Invalid response from Alchemy API' });
    //   }
    // // Convert 'ownedNfts' object to an array
    // const nftsArray = Object.values(nftsResponse.ownedNfts);

    //     // Log the entire array for debugging
    //     console.log('All NFTs:', nftsArray);

    // Filter NFTs based on the contract address
    // const filteredNfts = nfts.filter((nft) => {
    //     return (
    //       nft.contract.address === '0xdf6a44c29c0e78577245c12439d0cc6070f3e250'
    //     );
    //   });

    // Check if nftsResponse is an array and has a filter method
    // if (!Array.isArray(nftsResponse) || typeof nftsResponse.filter !== 'function') {
    //     return res.status(500).json({ error: 'Invalid response from Alchemy API' });
    // }

    // if (!nftsResponse || !Array.isArray(nftsResponse.nfts)) {
    //     return res.status(500).json({ error: 'Invalid response from Alchemy API' });
    //   }

    // Filter NFTs based on the contract address
    // const filteredNfts = nfts.filter((nft) => nft.contract.address === '0xdf6a44c29c0e78577245c12439d0cc6070f3e250');

    res.status(200).json({ nfts: nft });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});


// app.get('/getSymbol', async (req, res) => {
//   try {
//     const symbol = await ThumbsContract.symbol();
//     res.status(200).json({ symbol });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// app.post('/getStakeInfo', async (req, res) => {
//   try {
//     const { _staker } = req.body;

//     if (!_staker) {
//       return res.status(400).json({ error: 'Staker address is required' });
//     }

//     // Initialize a variable for the transaction object
//     const tx = {
//       to: STAKING_ADDRESS,
//       data: StakingContract.interface.encodeFunctionData('getStakeInfo', [_staker]),
//     };

//     // Use Alchemy SDK to fetch stake information
//     // // const alchemyWeb3 = createAlchemyWeb3(API_URL);
//     // const response = await alchemyProvider.eth.call(tx);

//     // // Log which node it used (Alchemy Live RPC or the SDK)
//     // console.log(`Used Alchemy Node: ${alchemyProvider.provider.connection.url}`);

//     res.status(200).json({ stakeInfo: response });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

app.get('/getOwnersForContract', async (req, res) => {
  try {
    const address = "0xdf6a44c29c0e78577245c12439d0cc6070f3e250";
    const response = await alchemy.nft.getOwnersForContract(address);
    
    res.status(200).json(response);


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  
});



app.post('/getNftsForContract', async (req, res) => {
  try {
    const { contractAddress } = req.body;

    if (!contractAddress) {
      return res.status(400).json({ error: 'Contract address is required' });
    }

    const response = await alchemy.nft.getNftsForContract(contractAddress);

    res.status(200).json(response);


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/getStakeInfo', async (req, res) => {
  try {
    const { _staker } = req.body;

    if (!_staker) {
      return res.status(400).json({ error: 'Token ID is required' });
    }

    const stakeInfo = await StakingContract.getStakeInfo(_staker);

    // const convertedStakeInfo = stakeInfo.map((item) => {
    //   if (Array.isArray(item)) {
    //     return item.map((innerItem) => {
    //       return {
    //         type: innerItem.type,
    //         decimal: convertHexToDecimal(innerItem.hex),
    //       };
    //     });
    //   } else {
    //     return {
    //       type: item.type,
    //       decimal: convertHexToDecimal(item.hex),
    //     };
    //   }
    // });

    res.status(200).json({ stakeInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
