import MerkleTree from "merkletreejs";
import { Hex, Address, keccak256, toHex } from "viem";

function getMerkleLeaf(user: Address) {
  return keccak256(user.toLowerCase() as Address);
}

function getMerkleTreeFromLeaves(leaves: Hex[]) {
  return new MerkleTree(leaves, keccak256, { sort: true });
}

export function generateMerkleTree(addresses: Address[]): {
  merkleRoot: Hex;
  merkleTree: MerkleTree;
  leaves: Hex[];
} {
  const leaves = addresses.map((a) => getMerkleLeaf(a));

  const merkleTree = getMerkleTreeFromLeaves(leaves);
  const merkleRoot = merkleTree.getHexRoot() as Hex;

  return { merkleRoot, merkleTree, leaves };
}

export async function getMerkleProof(merkleTree: MerkleTree, address: Address) {
  const leaf = getMerkleLeaf(address);

  if (merkleTree.getLeafIndex(Buffer.from(leaf.slice(2), "hex")) === -1)
    throw new Error(`Leaf not found in merkletree`);

  return merkleTree.getHexProof(leaf);
}
