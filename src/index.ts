import { MerkleTreeWhitelist } from "./merkle_tree_whitelist";

const main = async () => {
    merkleTreeTest();
};

function merkleTreeTest() {
    // Your whitelist from database
    const whitelist = [
        '0xA9fedBeC3781c72fe8bbC2294C5070b4b5051fE9',
        '0x83C2bbef5a09C4B46E049917a41E05fAf74b6275',
        '0x7237D795b3983a9F220bFDda18A7f55d4bE8911f'
    ];
    const mtw = new MerkleTreeWhitelist(whitelist);

    const root = mtw.getMerkleRoot();
    console.log(root);
    const proof =  mtw.generateProof("0xA9fedBeC3781c72fe8bbC2294C5070b4b5051fE9");
    console.log(proof);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    });
