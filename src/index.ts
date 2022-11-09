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
    // const tokenDeposit = await deposit();
    const r = await redeem("0x84831a641dd7877219b2e21121f3d6328f80ec07e20b5124b307125fc99528e8");
};

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


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    });

