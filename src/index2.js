const { BigNumber, providers, Wallet } = require('ethers')
const {
  getL2Network,
  Erc20Bridger,
} = require('@arbitrum/sdk')
require('dotenv').config()

const walletPrivateKey = process.env.PRIVKEY;
const l1Provider = new providers.JsonRpcProvider(process.env.L1RPC);
const l2Provider = new providers.JsonRpcProvider(process.env.L2RPC);
const l1Wallet = new Wallet(walletPrivateKey, l1Provider);
const l2Wallet = new Wallet(walletPrivateKey, l2Provider);

const main = async () => {
    const l2Network = await getL2Network(l2Provider);
    const erc20Bridge = new Erc20Bridger(l2Network);
    const erc20Address = "0x07865c6e87b9f70255377e024ace6630c1eaa37f";
    const tokenDepositAmount = BigNumber.from(50);

    const params = {
        amount: tokenDepositAmount,
        erc20L1Address: erc20Address,
        l1Signer: l1Wallet,
        l2Provider: l2Provider,
    }

    // const erc20DepositParams = <Erc20DepositParams> params;

    const fromAddress = await l1Wallet.getAddress(); 
    console.log(fromAddress);

    const tokenDeposit = await erc20Bridge.getDepositRequest({
        ...params,
        l1Provider: l1Provider,
        from: fromAddress,
    });
    console.log(tokenDeposit.txRequest.data);

    // const r = await deposit(erc20Bridge, params);
    // console.log(r);

    // const approveTx = await erc20Bridge.approveToken({
    //     l1Signer: l1Wallet,
    //     erc20L1Address: erc20Address,
    // })

    // const approveRec = await approveTx.wait()
    // console.log(
    //     `You successfully allowed the Arbitrum Bridge to spend DappToken ${approveRec.transactionHash}`
    // )

    /**
     * Deposit DappToken to L2 using erc20Bridge. This will escrow funds in the Gateway contract on L1, and send a message to mint tokens on L2.
     * The erc20Bridge.deposit method handles computing the necessary fees for automatic-execution of retryable tickets — maxSubmission cost & l2 gas price * gas — and will automatically forward the fees to L2 as callvalue
     * Also note that since this is the first DappToken deposit onto L2, a standard Arb ERC20 contract will automatically be deployed.
     * Arguments required are:
     * (1) amount: The amount of tokens to be transferred to L2
     * (2) erc20L1Address: L1 address of the ERC20 token to be depositted to L2
     * (2) l1Signer: The L1 address transferring token to L2
     * (3) l2Provider: An l2 provider
     */
    // const depositTx = await erc20Bridge.deposit({
    //     amount: tokenDepositAmount,
    //     erc20L1Address: erc20Address,
    //     l1Signer: l1Wallet,
    //     l2Provider: l2Provider,
    // });
    // console.log(`deposit transaction sent ${depositTx}`);

    // const depositRec = await depositTx.wait();
    // const l2Result = await depositRec.waitForL2(l2Provider);
    // console.log(`l2 result ${l2Result}`);


    // /**
    //  * The `complete` boolean tells us if the l1 to l2 message was successful
    //  */
    // l2Result.complete
    //     ? console.log(
    //         `L2 message successful: status: ${L1ToL2MessageStatus[l2Result.status]}`
    //     )
    //     : console.log(
    //         `L2 message failed: status ${L1ToL2MessageStatus[l2Result.status]}`
    //     );
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    });

