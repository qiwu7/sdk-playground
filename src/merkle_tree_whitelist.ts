import { ethers } from "ethers";
import { MerkleTree } from 'merkletreejs'

export class MerkleTreeWhitelist {
    private addresses: string[]
    private merkleTree: MerkleTree

    constructor(addresses: string[]) {
        this.addresses = addresses;
        this.merkleTree = this.getMerkleTree();
        this.merkleTree.print();
    }

    public getMerkleRoot(): string {
        const merkleRootHash = this.merkleTree.getHexRoot()
        return merkleRootHash;
    }

    public generateProof(userWalletAddress: string): string[] {
        // This variable will contain the signature we need
        let proof = []

        // Parse params passed to server and get user wallet address

        if (this.addresses.includes(userWalletAddress)) {
            const { keccak256 } = ethers.utils
            let hashedAddress = keccak256(userWalletAddress)
            proof = this.merkleTree.getHexProof(hashedAddress);
            return proof;
        }

        return [];
    }

    private getMerkleTree(): MerkleTree {
        const { keccak256 } = ethers.utils;
        let leaves = this.addresses.map((addr) => keccak256(addr));
        const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        return merkleTree;
    }
}
