import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

const main = async () => {
    merkleTreeTest();
};

function merkleTreeTest() {
    // Your whitelist from database
    const whitelist = [
        ['0xA9fedBeC3781c72fe8bbC2294C5070b4b5051fE9', 'speaker'],
        ['0x83C2bbef5a09C4B46E049917a41E05fAf74b6275', 'speaker'],
        ['0x7237D795b3983a9F220bFDda18A7f55d4bE8911f', 'attendee'],
        ['0x0ecEEB86a43cbF87b58D571EFCD7215ACf5fF182', 'speaker'],
    ];

    const tree = StandardMerkleTree.of(whitelist, ['address', 'string']);

    console.log(tree.render());
    const root = tree.root;
    console.log(root);
    const proof =  tree.getProof(['0x0ecEEB86a43cbF87b58D571EFCD7215ACf5fF182', 'speaker']);
    console.log(proof);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    });
