import { createWalletClient, createPublicClient, custom, http, parseAbi } from "viem";
import { celo, celoAlfajores } from "viem/chains";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const REWARD_DISTRIBUTOR_ABI = parseAbi([
"function claimReward(bytes32 claimId, uint256 amount, uint256 nonce, uint256 deadline, bytes signature) external",
]);

export async function claimKasicTaskReward(taskId: string) {
const ethereum = (window as unknown as { ethereum?: unknown }).ethereum;
if (!ethereum) {
throw new Error("No Celo/EVM wallet detected. Open in MiniPay or connect MetaMask to claim KASIC.");
}

const walletClient = createWalletClient({
transport: custom(ethereum as Parameters<typeof custom>[0]),
});

const [account] = await walletClient.requestAddresses();
const jwt = localStorage.getItem("token") || "";

const sigRes = await fetch(`${API_URL}/api/rewards/claim-signature`, {
method: "POST",
headers: {
  "Content-Type": "application/json",
  ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
},
body: JSON.stringify({ taskId, walletAddress: account }),
});

if (!sigRes.ok) throw new Error("Unable to authorize KASIC reward claim");
const payload = await sigRes.json();

const chain = payload.chainId === celo.id ? celo : celoAlfajores;
const publicClient = createPublicClient({ chain, transport: http() });

const txHash = await walletClient.writeContract({
account,
chain,
address: payload.contractAddress,
abi: REWARD_DISTRIBUTOR_ABI,
functionName: "claimReward",
args: [
  payload.claimId as `0x${string}`,
  BigInt(payload.amount),
  BigInt(payload.nonce),
  BigInt(payload.deadline),
  payload.signature,
],
});

await publicClient.waitForTransactionReceipt({ hash: txHash });

await fetch(`${API_URL}/api/rewards/claims/${payload.claimId}/confirm`, {
method: "POST",
headers: {
  "Content-Type": "application/json",
  ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
},
body: JSON.stringify({ txHash }),
});

return txHash;
}
