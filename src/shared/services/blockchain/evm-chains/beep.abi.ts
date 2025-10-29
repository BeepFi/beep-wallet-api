export const beepAbi =[
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "supportedTokens",
          "type": "address[]"
        },
        {
          "internalType": "string[]",
          "name": "supportedProtocols",
          "type": "string[]"
        },
        {
          "internalType": "uint64",
          "name": "defaultTimeoutHeight",
          "type": "uint64"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "id",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        }
      ],
      "name": "IntentCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "id",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "executor",
          "type": "address"
        }
      ],
      "name": "IntentFilled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "id",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        }
      ],
      "name": "IntentCancelled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "id",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        }
      ],
      "name": "IntentWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "tuple[]",
          "name": "tokens",
          "type": "tuple[]",
          "components": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isNative",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ]
        }
      ],
      "name": "DepositToWallet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "tuple[]",
          "name": "tokens",
          "type": "tuple[]",
          "components": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isNative",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ]
        }
      ],
      "name": "TransferFromWallet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "funder",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "PaymasterFunded",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "tuple[]",
          "name": "inputTokens",
          "type": "tuple[]",
          "components": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isNative",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ]
        },
        {
          "internalType": "tuple[]",
          "name": "outputTokens",
          "type": "tuple[]",
          "components": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isNative",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "targetAddress",
              "type": "address"
            }
          ]
        },
        {
          "internalType": "uint64",
          "name": "timeout",
          "type": "uint64"
        },
        {
          "internalType": "tuple",
          "name": "tip",
          "type": "tuple",
          "components": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isNative",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ]
        },
        {
          "internalType": "bool",
          "name": "useWalletBalance",
          "type": "bool"
        },
        {
          "internalType": "uint8",
          "name": "priority",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "allowPaymasterFallback",
          "type": "bool"
        }
      ],
      "name": "createIntent",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "intentId",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "useWalletBalance",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "allowPaymasterFallback",
          "type": "bool"
        }
      ],
      "name": "fillIntent",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "intentId",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "allowPaymasterFallback",
          "type": "bool"
        }
      ],
      "name": "cancelIntent",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "intentId",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "allowPaymasterFallback",
          "type": "bool"
        }
      ],
      "name": "withdrawIntentFund",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paymasterFund",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "paymasterFundToken",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "tuple[]",
          "name": "tokens",
          "type": "tuple[]",
          "components": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isNative",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ]
        }
      ],
      "name": "depositToWallet",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "tuple[]",
          "name": "tokens",
          "type": "tuple[]",
          "components": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isNative",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ]
        }
      ],
      "name": "transferFromWallet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newAdmin",
          "type": "address"
        }
      ],
      "name": "updateAdmin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "tokens",
          "type": "address[]"
        }
      ],
      "name": "addSupportedTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "tokens",
          "type": "address[]"
        }
      ],
      "name": "removeSupportedTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string[]",
          "name": "protocols",
          "type": "string[]"
        }
      ],
      "name": "addSupportedProtocols",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string[]",
          "name": "protocols",
          "type": "string[]"
        }
      ],
      "name": "removeSupportedProtocols",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "defaultTimeoutHeight",
          "type": "uint64"
        }
      ],
      "name": "updateDefaultTimeoutHeight",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getConfig",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "admin",
              "type": "address"
            },
            {
              "internalType": "address[]",
              "name": "supportedTokens",
              "type": "address[]"
            },
            {
              "internalType": "string[]",
              "name": "supportedProtocols",
              "type": "string[]"
            },
            {
              "internalType": "uint64",
              "name": "defaultTimeoutHeight",
              "type": "uint64"
            }
          ],
          "internalType": "struct BeepContract.Config",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "id",
          "type": "string"
        }
      ],
      "name": "getIntent",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "id",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "internalType": "tuple[]",
              "name": "inputTokens",
              "type": "tuple[]",
              "components": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "isNative",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ]
            },
            {
              "internalType": "tuple[]",
              "name": "outputTokens",
              "type": "tuple[]",
              "components": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "isNative",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "targetAddress",
                  "type": "address"
                }
              ]
            },
            {
              "internalType": "address",
              "name": "executor",
              "type": "address"
            },
            {
              "internalType": "uint8",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "uint64",
              "name": "createdAt",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "timeout",
              "type": "uint64"
            },
            {
              "internalType": "tuple",
              "name": "tip",
              "type": "tuple",
              "components": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "isNative",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ]
            },
            {
              "internalType": "uint8",
              "name": "priority",
              "type": "uint8"
            }
          ],
          "internalType": "struct BeepContract.Intent",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserNonce",
      "outputs": [
        {
          "internalType": "uint128",
          "name": "",
          "type": "uint128"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getWalletBalance",
      "outputs": [
        {
          "internalType": "tuple[]",
          "name": "",
          "type": "tuple[]",
          "components": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isNative",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ]
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "priority",
          "type": "uint8"
        }
      ],
      "name": "calculateFee",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "HBAR",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paymasterNative",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "paymasterTokens",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
  