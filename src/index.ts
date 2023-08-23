import { BigNumber, providers, Wallet } from "ethers";
import {getL2Network, Erc20Bridger, L1ToL2MessageStatus, L1TransactionReceipt} from "@arbitrum/sdk";
import { Erc20DepositParams, L1ToL2TxReqAndSignerProvider } from "@arbitrum/sdk/dist/lib/assetBridger/erc20Bridger";
import { isL1ToL2TransactionRequest, L1ToL2TransactionRequest } from "@arbitrum/sdk/dist/lib/dataEntities/transactionRequest";
import { SignerProviderUtils } from "@arbitrum/sdk/dist/lib/dataEntities/signerOrProvider";
import { L1ToL2MessageWaitResult } from "@arbitrum/sdk/dist/lib/message/L1ToL2Message";
require('dotenv').config();

const walletPrivateKey = process.env.PRIVKEY as string;
const l1Provider = new providers.JsonRpcProvider(process.env.L1RPC, 5);
const l2Provider = new providers.JsonRpcProvider(process.env.L2RPC);
const l1Wallet = new Wallet(walletPrivateKey, l1Provider);
const l2Wallet = new Wallet(walletPrivateKey, l2Provider);

const main = async () => {
};


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    });

