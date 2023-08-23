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
    console.log(await l1Wallet.getAddress());

    // 1. Get Redeem Data
    const redeemData = await getRedeemData("0xcf0aebc62eb1bcf6f5769abffce0c95732dd1b69f48960762d39595257cdcd79");
    console.log(redeemData);

    // 2. Redeem Stuck Deposit
    // const hash = await redeem("0x34c02fe6e13849fac3097752f8f23df43650a6c848e45063596eb9dfa665bb59");

    // 3. get deposit request data 
    // const tokenDeposit = await deposit();

    // 4. getL2MessageStatus
    // while (true) {
    //     const status = await getL2Status("0xcf0aebc62eb1bcf6f5769abffce0c95732dd1b69f48960762d39595257cdcd79");
    //     console.log(`time: ${new Date()} status: ${status}`);
    //     await delay(10000);
    // }
};

const getRedeemData = async (txHash: string): Promise<string> => {
    if (!txHash.startsWith('0x') || txHash.trim().length != 66) {
        throw new Error(`invalid tx hash: ${txHash} `);
    }
    console.log("retriving status");

    const receipt = await l1Provider.getTransactionReceipt(txHash);
    const l1Receipt = new L1TransactionReceipt(receipt);
    const messages = await l1Receipt.getL1ToL2Messages(l2Wallet);
    const l1ToL2Msg = messages[0];
    const redeemData = l1ToL2Msg.retryableCreationId;
    return redeemData;
}

const getL2Status = async (txHash: string): Promise<L1ToL2MessageStatus> => {
    if (!txHash.startsWith('0x') || txHash.trim().length != 66) {
        throw new Error(`invalid tx hash: ${txHash} `);
    }
    console.log("retriving status");

    const receipt = await l1Provider.getTransactionReceipt(txHash);
    const l1Receipt = new L1TransactionReceipt(receipt);
    const messages = await l1Receipt.getL1ToL2Messages(l2Wallet);
    const l1ToL2Msg = messages[0];
    console.log("got message");

    const status1 = await l1ToL2Msg.status();
    // const messageRec = await l1ToL2Msg.waitForStatus();
    // const status2 = await messageRec.status;
    return status1;
}

const redeem = async (txHash : string): Promise<string> => {
    if (!txHash.startsWith('0x') || txHash.trim().length != 66) {
        throw new Error(`invalid tx hash: ${txHash} `);
    }

    const receipt = await l1Provider.getTransactionReceipt(txHash);
    const l1Receipt = new L1TransactionReceipt(receipt);

    const messages = await l1Receipt.getL1ToL2Messages(l2Wallet);
    const message = await messages[0];
    const messageRec = await message.waitForStatus();
    const status = await messageRec.status;
    if (status === L1ToL2MessageStatus.REDEEMED) {
        console.log(`L2 retryable txn is already executed`);
        return "";
    } else {
        console.log(`L2 retryable txn failed with status ${L1ToL2MessageStatus[status]}`);
    }
    console.log(`Redeeming the ticket now`);
    /**
     * We use the redeem() method from Arbitrum SDK to manually redeem our ticket
     */
    const l2Tx = await message.redeem();
    const l2Receipt = await l2Tx.waitForRedeem();
    const l2TxHash = await l2Receipt.transactionHash;
    console.log(
        'The L2 side of your transaction is now execeuted:',
        l2TxHash
    );

    return l2TxHash;
};

const deposit = async (): Promise<L1ToL2TransactionRequest> => {
    const l2Network = await getL2Network(l2Provider);
    const erc20Bridge = new Erc20Bridger(l2Network);
    const erc20Address = "0x07865c6e87b9f70255377e024ace6630c1eaa37f";
    const tokenDepositAmount = BigNumber.from(501);

    const params = {
        amount: tokenDepositAmount,
        erc20L1Address: erc20Address,
        l1Signer: l1Wallet,
        l2Provider: l2Provider,
    };

    const erc20DepositParams = <Erc20DepositParams> params;

    const fromAddress = await l1Wallet.getAddress(); 
    const l1p = SignerProviderUtils.getProviderOrThrow(params.l1Signer);

    const tokenDeposit = await erc20Bridge.getDepositRequest({
        ...erc20DepositParams,
        l1Provider: l1p,
        from: fromAddress,
    });

    console.log(tokenDeposit);
    // console.log(tokenDeposit.txRequest.data);
    return tokenDeposit;
}

const delay = async (ms: number) => {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    });

