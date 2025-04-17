// ====== CONFIGURATION ====== //
const POLL_CONTRACT_ADDRESS = "0x40ca06Ce890Eb25343A195a49BD7d6EdBb69737E";
const GM_CONTRACT_ADDRESS = "0x52D8a1a61001910d5504dE60822b6A73aE0d7919";
const SOMNIA_RPC = "https://dream-rpc.somnia.network/";

// ====== STATE ====== //
let provider, signer, currentAccount;
let pollContract, gmContract;

// ====== INITIALIZATION ====== //
document.addEventListener('DOMContentLoaded', async () => {
  console.log("[1] DOM loaded");
  
  // 1. Check MetaMask installation
  if (typeof window.ethereum === 'undefined') {
    showError("MetaMask not installed! Download: https://metamask.io/download");
    return;
  }
  console.log("[2] MetaMask detected");

  // 2. Set up event listeners
  document.getElementById('connectWallet').addEventListener('click', connectWallet);
  document.getElementById('createPoll').addEventListener('click', createPoll);
  document.getElementById('votePoll').addEventListener('click', votePoll);
  document.getElementById('sendGM').addEventListener('click', sendGM);

  // 3. Try auto-connect
  tryAutoConnect();
});

// ====== CORE FUNCTIONS ====== //
async function tryAutoConnect() {
  console.log("[3] Trying auto-connect...");
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  
  if (accounts.length > 0) {
    console.log("[4] Found existing connection");
    await handleWalletConnected(accounts[0]);
  }
}

async function connectWallet() {
  console.log("[5] Connect button clicked");
  showLoading(true);
  clearError();

  try {
    // 1. Request accounts
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    console.log("[6] Accounts received:", accounts);

    if (accounts.length === 0) {
      throw new Error("No accounts found");
    }

    // 2. Initialize provider
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    currentAccount = accounts[0];

    // 3. Initialize contracts
    await initializeContracts();

    // 4. Update UI
    updateConnectionStatus();
    console.log("[7] Wallet connected successfully");
    alert(`✅ Connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`);

  } catch (error) {
    console.error("[ERROR] Connection failed:", error);
    showError(`❌ ${error.message || "Connection failed"}`);
  } finally {
    showLoading(false);
  }
}

async function initializeContracts() {
  console.log("[8] Initializing contracts...");
  
  // PollSystem Contract ABI (Simplified)
  const pollABI = [
    "function createPoll(string _title, string[] _names, string[] _images, string[] _agendas) payable",
    "function vote(uint256 _pollId, uint256 _candidateIndex) payable",
    "function getCandidates(uint256 _pollId) view returns (tuple(string name, string imageURL, string agenda, uint256 voteCount)[])"
  ];

  // GMSender Contract ABI
  const gmABI = [
    "function sendGM() payable",
    "function lastGMTime(address) view returns (uint256)"
  ];

  pollContract = new ethers.Contract(POLL_CONTRACT_ADDRESS, pollABI, signer);
  gmContract = new ethers.Contract(GM_CONTRACT_ADDRESS, gmABI, signer);
}

// ====== CONTRACT INTERACTIONS ====== //
async function createPoll() {
  if (!checkConnection()) return;
  
  const title = document.getElementById('pollTitle').value;
  const names = Array.from(document.querySelectorAll('.candidate-name')).map(i => i.value);
  const images = Array.from(document.querySelectorAll('.candidate-image')).map(i => i.value);
  const agendas = Array.from(document.querySelectorAll('.candidate-agenda')).map(i => i.value);

  try {
    const tx = await pollContract.createPoll(title, names, images, agendas, {
      value: ethers.parseEther("0.001")
    });
    await tx.wait();
    alert("✅ Poll created!");
  } catch (error) {
    showError(`❌ ${error.reason || error.message}`);
  }
}

async function votePoll() {
  if (!checkConnection()) return;
  
  const pollId = document.getElementById('pollId').value;
  const candidateIndex = document.getElementById('candidateIndex').value;

  try {
    const tx = await pollContract.vote(pollId, candidateIndex, {
      value: ethers.parseEther("0.001")
    });
    await tx.wait();
    alert("✅ Vote submitted!");
  } catch (error) {
    showError(`❌ ${error.reason || error.message}`);
  }
}

async function sendGM() {
  if (!checkConnection()) return;
  
  try {
    const tx = await gmContract.sendGM({
      value: ethers.parseEther("0.0005")
    });
    await tx.wait();
    document.getElementById('gmStatus').textContent = "✅ GM sent!";
  } catch (error) {
    document.getElementById('gmStatus').textContent = `❌ ${error.reason || "Failed"}`;
  }
}

// ====== UI HELPERS ====== //
function updateConnectionStatus() {
  document.getElementById('walletAddress').textContent = 
    `Connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
  document.getElementById('connectWallet').textContent = "Disconnect";
}

function checkConnection() {
  if (!currentAccount) {
    showError("Please connect wallet first!");
    return false;
  }
  return true;
}

function showLoading(show) {
  document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}

function showError(message) {
  document.getElementById('errorMessage').textContent = message;
}

function clearError() {
  document.getElementById('errorMessage').textContent = '';
}

// ====== EVENT HANDLERS ====== //
window.ethereum.on('accountsChanged', (accounts) => {
  if (accounts.length === 0) {
    // Wallet disconnected
    currentAccount = null;
    document.getElementById('walletAddress').textContent = "Not connected";
    document.getElementById('connectWallet').textContent = "Connect Wallet";
  } else {
    // Account changed
    currentAccount = accounts[0];
    updateConnectionStatus();
  }
});

window.ethereum.on('chainChanged', () => {
  window.location.reload();
});