import { ethers } from "ethers";
import { MerkleTree } from 'merkletreejs'

export class MerkleTreeWhitelist {
    private addresses: string[]

    constructor(addresses: string[]) {
        this.addresses = addresses;
    }

    public getMerkleRoot(): string {
        const merkleTree = this.getMerkleTree();
        const merkleRootHash = merkleTree.getHexRoot()
        return merkleRootHash;
    }

    public generateProof(userWalletAddress: string): string[] {
        // This variable will contain the signature we need
        let proof = []

        // Parse params passed to server and get user wallet address

        if (this.addresses.includes(userWalletAddress)) {
            const merkleTree = this.getMerkleTree();
            const { keccak256 } = ethers.utils
            let hashedAddress = keccak256(userWalletAddress)
            proof = merkleTree.getHexProof(hashedAddress);
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


export function generateProof(addresses: string[], userWalletAddress: string) {
    // This variable will contain the signature we need
    let proof = []

    // Parse params passed to server and get user wallet address

    if (addresses.includes(userWalletAddress)) {
        const { keccak256 } = ethers.utils
        let leaves = addresses.map((addr) => keccak256(addr))
        const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        let hashedAddress = keccak256(userWalletAddress)
        proof = merkleTree.getHexProof(hashedAddress);
        console.log(proof);
    }
}
