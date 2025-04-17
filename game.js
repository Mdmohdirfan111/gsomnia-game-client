// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('levelDisplay');
const pauseButton = document.getElementById('pauseButton');
const startScreen = document.getElementById('startScreen');
const gameContainer = document.getElementById('gameContainer');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const startButton = document.getElementById('startButton');
const resumeButton = document.getElementById('resumeButton');
const restartButton = document.getElementById('restartButton');
const connectWalletButton = document.getElementById('connectWalletButton');
const walletAddressDisplay = document.getElementById('walletAddress');
const gsomniaButton = document.getElementById('gsomniaButton');
const gsomniaStatus = document.getElementById('gsomniaStatus');
const levelCompleteModal = document.getElementById('levelCompleteModal');
const levelCompleteTitle = document.getElementById('levelCompleteTitle');
const mintNFTButton = document.getElementById('mintNFTButton');
const nextLevelButton = document.getElementById('nextLevelButton');
const transactionModal = document.getElementById('transactionModal');
const transactionHashDisplay = document.getElementById('transactionHashDisplay');
const closeTransactionModal = document.getElementById('closeTransactionModal');

// Game Constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const PLAYER_SPEED = 6;
const ENEMY_SPEED = 1.5;
const COIN_SCORE = 100;
const ENEMY_DEFEAT_SCORE = 200;
const LEVEL_WIDTH = 3200;
const CAMERA_SPEED = 0.3;
const FRICTION = 0.85;
const JUMP_COOLDOWN = 200;

// Blockchain Constants
const SOMNIA_TESTNET = {
    chainId: '0xc4a8', // Chain ID 50312 in hex (for reference only, no checks)
    chainName: 'Somnia Testnet',
    nativeCurrency: {
        name: 'Somnia Test Token',
        symbol: 'STT',
        decimals: 18
    },
    rpcUrls: ['https://rpc.testnet.somnia.network/'],
    blockExplorerUrls: ['https://somnia-testnet.socialscan.io/']
};

const CONTRACT_ADDRESS = '0xAD23Efb5e870D7cb23102e318bdF129F3F2c664b';
const CONTRACT_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "initialOwner",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "approved",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "operator",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "approved",
                "type": "bool"
            }
        ],
        "name": "ApprovalForAll",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "GsomniaExecuted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "tokenURI",
                "type": "string"
            }
        ],
        "name": "NFTMinted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "player",
                "type": "address"
            }
        ],
        "name": "canExecuteGsomnia",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "executeGsomnia",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "getApproved",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "operator",
                "type": "address"
            }
        ],
        "name": "isApprovedForAll",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "lastGsomniaTime",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "tokenURI",
                "type": "string"
            }
        ],
        "name": "mintLevelNFT",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "ownerOf",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "operator",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "approved",
                "type": "bool"
            }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "interfaceId",
                "type": "bytes4"
            }
        ],
        "name": "supportsInterface",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "tokenURI",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Game State
const gameState = {
    current: 'start', // start, play, paused, gameOver, levelComplete
    score: 0,
    currentLevel: 1,
    keys: {},
    lastJumpTime: 0,
    cameraX: 0,
    targetCameraX: 0,
    nftMintedForLevel: {} // Track NFT minting per level
};

// Blockchain State
let web3;
let contract;
let accounts;

// Player Object
const player = {
    x: 50,
    y: 300,
    width: 32,
    height: 32,
    speed: PLAYER_SPEED,
    velX: 0,
    velY: 0,
    jumping: false,
    onGround: false,
    sprite: new Image(),
    frame: 0,
    frameCount: 4,
    frameSpeed: 6,
    frameTimer: 0,
    loaded: false,
    facingRight: true,
    alive: true
};

// Assets Loading
player.sprite.src = 'assets/images/mario.png';
player.sprite.onload = () => {
    player.loaded = true;
    console.log('Mario sprite loaded successfully');
};
player.sprite.onerror = () => {
    console.error('Failed to load Mario sprite');
    player.loaded = false;
};

const goombaSprite = new Image();
goombaSprite.src = 'assets/images/goomba.png';
goombaSprite.onload = () => console.log('Goomba sprite loaded successfully');
goombaSprite.onerror = () => console.error('Failed to load Goomba sprite');

const coinSprite = new Image();
coinSprite.src = 'assets/images/coin.png';
coinSprite.onload = () => console.log('Coin sprite loaded successfully');
coinSprite.onerror = () => console.error('Failed to load Coin sprite');

const blockSprite = new Image();
blockSprite.src = 'assets/images/block.png';
blockSprite.onload = () => console.log('Block sprite loaded successfully');
blockSprite.onerror = () => console.error('Failed to load Block sprite');

const backgroundImage = new Image();
backgroundImage.src = 'assets/images/background.jpg';
backgroundImage.onload = () => console.log('Background image loaded successfully');
backgroundImage.onerror = () => console.error('Failed to load Background image');

// Levels Data (Updated with More Variety)
const levels = [
    // Level 1
    {
        platforms: [
            { x: 0, y: 350, width: LEVEL_WIDTH, height: 50, type: 'ground' },
            { x: 200, y: 250, width: 150, height: 20, type: 'block' },
            { x: 400, y: 200, width: 100, height: 20, type: 'block' },
            { x: 600, y: 300, width: 150, height: 20, type: 'block' },
            { x: 900, y: 250, width: 150, height: 20, type: 'block' },
            { x: 1200, y: 200, width: 100, height: 20, type: 'block' },
            { x: 1500, y: 300, width: 150, height: 20, type: 'block' },
            { x: 1800, y: 250, width: 150, height: 20, type: 'block' },
            { x: 2100, y: 200, width: 100, height: 20, type: 'block' },
            { x: 2400, y: 300, width: 150, height: 20, type: 'block' },
            { x: 2700, y: 250, width: 150, height: 20, type: 'block' }
        ],
        enemies: [
            { x: 300, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 600, y: 320, width: 32, height: 32, direction: 1, alive: true },
            { x: 900, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 1200, y: 320, width: 32, height: 32, direction: 1, alive: true },
            { x: 1500, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 1800, y: 320, width: 32, height: 32, direction: 1, alive: true },
            { x: 2100, y: 320, width: 32, height: 32, direction: -1, alive: true }
        ],
        coins: [
            { x: 220, y: 220, width: 20, height: 20, collected: false },
            { x: 420, y: 170, width: 20, height: 20, collected: false },
            { x: 620, y: 270, width: 20, height: 20, collected: false },
            { x: 920, y: 220, width: 20, height: 20, collected: false },
            { x: 1220, y: 170, width: 20, height: 20, collected: false },
            { x: 1520, y: 270, width: 20, height: 20, collected: false },
            { x: 1820, y: 220, width: 20, height: 20, collected: false },
            { x: 2120, y: 170, width: 20, height: 20, collected: false },
            { x: 2420, y: 270, width: 20, height: 20, collected: false },
            { x: 2720, y: 220, width: 20, height: 20, collected: false }
        ],
        endFlag: { x: LEVEL_WIDTH - 50, y: 320, width: 20, height: 30 }
    },
    // Level 2
    {
        platforms: [
            { x: 0, y: 350, width: 400, height: 50, type: 'ground' },
            { x: 500, y: 350, width: 400, height: 50, type: 'ground' },
            { x: 1000, y: 350, width: LEVEL_WIDTH - 1000, height: 50, type: 'ground' },
            { x: 300, y: 300, width: 100, height: 20, type: 'block' },
            { x: 600, y: 250, width: 150, height: 20, type: 'block' },
            { x: 900, y: 200, width: 100, height: 20, type: 'block' },
            { x: 1200, y: 250, width: 150, height: 20, type: 'block' },
            { x: 1500, y: 200, width: 100, height: 20, type: 'block' },
            { x: 1800, y: 250, width: 150, height: 20, type: 'block' },
            { x: 2100, y: 200, width: 100, height: 20, type: 'block' },
            { x: 2400, y: 250, width: 150, height: 20, type: 'block' },
            { x: 2700, y: 200, width: 100, height: 20, type: 'block' }
        ],
        enemies: [
            { x: 400, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 800, y: 320, width: 32, height: 32, direction: 1, alive: true },
            { x: 1000, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 1300, y: 320, width: 32, height: 32, direction: 1, alive: true },
            { x: 1600, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 1900, y: 320, width: 32, height: 32, direction: 1, alive: true },
            { x: 2200, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 2500, y: 320, width: 32, height: 32, direction: 1, alive: true }
        ],
        coins: [
            { x: 320, y: 270, width: 20, height: 20, collected: false },
            { x: 620, y: 220, width: 20, height: 20, collected: false },
            { x: 920, y: 170, width: 20, height: 20, collected: false },
            { x: 1220, y: 220, width: 20, height: 20, collected: false },
            { x: 1520, y: 170, width: 20, height: 20, collected: false },
            { x: 1820, y: 220, width: 20, height: 20, collected: false },
            { x: 2120, y: 170, width: 20, height: 20, collected: false },
            { x: 2420, y: 220, width: 20, height: 20, collected: false },
            { x: 2720, y: 170, width: 20, height: 20, collected: false }
        ],
        endFlag: { x: LEVEL_WIDTH - 50, y: 320, width: 20, height: 30 }
    },
    // Level 3
    {
        platforms: [
            { x: 0, y: 350, width: 300, height: 50, type: 'ground' },
            { x: 400, y: 350, width: 300, height: 50, type: 'ground' },
            { x: 800, y: 350, width: LEVEL_WIDTH - 800, height: 50, type: 'ground' },
            { x: 200, y: 300, width: 100, height: 20, type: 'block' },
            { x: 400, y: 250, width: 100, height: 20, type: 'block' },
            { x: 600, y: 200, width: 100, height: 20, type: 'block' },
            { x: 800, y: 150, width: 100, height: 20, type: 'block' },
            { x: 1000, y: 200, width: 100, height: 20, type: 'block' },
            { x: 1200, y: 250, width: 100, height: 20, type: 'block' },
            { x: 1400, y: 200, width: 100, height: 20, type: 'block' },
            { x: 1600, y: 150, width: 100, height: 20, type: 'block' },
            { x: 1800, y: 200, width: 100, height: 20, type: 'block' },
            { x: 2000, y: 250, width: 100, height: 20, type: 'block' },
            { x: 2200, y: 200, width: 100, height: 20, type: 'block' },
            { x: 2400, y: 150, width: 100, height: 20, type: 'block' },
            { x: 2600, y: 200, width: 100, height: 20, type: 'block' },
            { x: 2800, y: 250, width: 100, height: 20, type: 'block' }
        ],
        enemies: [
            { x: 300, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 500, y: 320, width: 32, height: 32, direction: 1, alive: true },
            { x: 700, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 900, y: 320, width: 32, height: 32, direction: 1, alive: true },
            { x: 1100, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 1300, y: 320, width: 32, height: 32, direction: 1, alive: true },
            { x: 1500, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 1700, y: 320, width: 32, height: 32, direction: 1, alive: true },
            { x: 1900, y: 320, width: 32, height: 32, direction: -1, alive: true }
        ],
        coins: [
            { x: 220, y: 270, width: 20, height: 20, collected: false },
            { x: 420, y: 220, width: 20, height: 20, collected: false },
            { x: 620, y: 170, width: 20, height: 20, collected: false },
            { x: 820, y: 120, width: 20, height: 20, collected: false },
            { x: 1020, y: 170, width: 20, height: 20, collected: false },
            { x: 1220, y: 220, width: 20, height: 20, collected: false },
            { x: 1420, y: 170, width: 20, height: 20, collected: false },
            { x: 1620, y: 120, width: 20, height: 20, collected: false },
            { x: 1820, y: 170, width: 20, height: 20, collected: false },
            { x: 2020, y: 220, width: 20, height: 20, collected: false },
            { x: 2220, y: 170, width: 20, height: 20, collected: false },
            { x: 2420, y: 120, width: 20, height: 20, collected: false }
        ],
        endFlag: { x: LEVEL_WIDTH - 50, y: 320, width: 20, height: 30 }
    },
    // Level 4
    {
        platforms: [
            { x: 0, y: 350, width: 200, height: 50, type: 'ground' },
            { x: 300, y: 350, width: 200, height: 50, type: 'ground' },
            { x: 600, y: 350, width: 200, height: 50, type: 'ground' },
            { x: 900, y: 350, width: LEVEL_WIDTH - 900, height: 50, type: 'ground' },
            { x: 250, y: 300, width: 100, height: 20, type: 'block' },
            { x: 500, y: 250, width: 100, height: 20, type: 'block' },
            { x: 750, y: 200, width: 100, height: 20, type: 'block' },
            { x: 1000, y: 150, width: 100, height: 20, type: 'block' },
            { x: 1250, y: 100, width: 100, height: 20, type: 'block' },
            { x: 1500, y: 150, width: 100, height: 20, type: 'block' },
            { x: 1750, y: 200, width: 100, height: 20, type: 'block' },
            { x: 2000, y: 250, width: 100, height: 20, type: 'block' },
            { x: 2200, y: 200, width: 100, height: 20, type: 'block' },
            { x: 2400, y: 150, width: 100, height: 20, type: 'block' },
            { x: 2600, y: 200, width: 100, height: 20, type: 'block' },
            { x: 2800, y: 250, width: 100, height: 20, type: 'block' },
            { x: 3000, y: 200, width: 100, height: 20, type: 'block' }
        ],
        enemies: [
            { x: 300, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 600, y: 320, width: 32, height: 32, direction: 1, alive: true },
            { x: 900, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 1200, y: 320, width: 32, height: 32, direction: 1, alive: true },
            { x: 1400, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 1600, y: 320, width: 32, height: 32, direction: 1, alive: true },
            { x: 1800, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 2000, y: 320, width: 32, height: 32, direction: 1, alive: true },
            { x: 2200, y: 320, width: 32, height: 32, direction: -1, alive: true },
            { x: 2400, y: 320, width: 32, height: 32, direction: 1, alive: true }
        ],
        coins: [
            { x: 270, y: 270, width: 20, height: 20, collected: false },
            { x: 520, y: 220, width: 20, height: 20, collected: false },
            { x: 770, y: 170, width: 20, height: 20, collected: false },
            { x: 1020, y: 120, width: 20, height: 20, collected: false },
            { x: 1270, y: 70, width: 20, height: 20, collected: false },
            { x: 1520, y: 120, width: 20, height: 20, collected: false },
            { x: 1770, y: 170, width: 20, height: 20, collected: false },
            { x: 2020, y: 220, width: 20, height: 20, collected: false },
            { x: 2220, y: 170, width: 20, height: 20, collected: false },
            { x: 2420, y: 120, width: 20, height: 20, collected: false },
            { x: 2620, y: 170, width: 20, height: 20, collected: false },
            { x: 2820, y: 220, width: 20, height: 20, collected: false }
        ],
        endFlag: { x: LEVEL_WIDTH - 50, y: 320, width: 20, height: 30 }
    }
];

// Current Level Objects
let platforms = [];
let enemies = [];
let coins = [];
let endFlag = null;

// Load Level Function
function loadLevel(level) {
    console.log(`Loading Level ${level}`);
    const lvl = levels[level - 1];
    if (!lvl) {
        console.error(`Level ${level} not found!`);
        return;
    }
    platforms = lvl.platforms.map(platform => ({ ...platform }));
    enemies = lvl.enemies.map(enemy => ({ ...enemy }));
    coins = lvl.coins.map(coin => ({ ...coin }));
    endFlag = { ...lvl.endFlag };
    player.x = 50;
    player.y = 300;
    player.velX = 0;
    player.velY = 0;
    player.jumping = false;
    player.onGround = false;
    player.alive = true;
    gameState.cameraX = 0;
    gameState.targetCameraX = 0;
    levelDisplay.textContent = `Level: ${gameState.currentLevel}`;
    console.log('Level loaded successfully:', lvl);
}

// Blockchain Functions
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Connected accounts:', accounts);

            web3 = new Web3(window.ethereum);
            contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

            walletAddressDisplay.style.display = 'inline';
            walletAddressDisplay.textContent = `Wallet: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;

            await checkGsomniaEligibility();

            startButton.style.display = 'block';
            gsomniaButton.style.display = 'inline';
            connectWalletButton.style.display = 'none';
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect MetaMask: ' + error.message);
        }
    } else {
        alert('MetaMask not detected. Please install MetaMask to play.');
    }
}

async function checkGsomniaEligibility() {
    if (!contract || !accounts) {
        console.error('Wallet not connected');
        gsomniaStatus.textContent = 'Wallet not connected';
        gsomniaStatus.style.display = 'inline';
        return;
    }
    try {
        const canExecute = await contract.methods.canExecuteGsomnia(accounts[0]).call();
        if (canExecute) {
            gsomniaButton.disabled = false;
            gsomniaStatus.textContent = 'Gsomnia Ready!';
            gsomniaStatus.style.color = '#ffd700';
        } else {
            gsomniaButton.disabled = true;
            gsomniaStatus.textContent = 'Gsomnia on Cooldown (24h)';
            gsomniaStatus.style.color = '#ff4500';
        }
        gsomniaStatus.style.display = 'inline';
    } catch (error) {
        console.error('Error checking Gsomnia eligibility:', error);
        gsomniaStatus.textContent = 'Error checking Gsomnia status';
        gsomniaStatus.style.display = 'inline';
    }
}

async function executeGsomnia() {
    if (!contract || !accounts) {
        console.error('Wallet not connected');
        gsomniaStatus.textContent = 'Wallet not connected';
        return;
    }
    try {
        gsomniaButton.disabled = true;
        gsomniaStatus.textContent = 'Executing Gsomnia...';
        const tx = await contract.methods.executeGsomnia().send({ from: accounts[0] });
        gsomniaStatus.textContent = 'Gsomnia Executed! Cooldown Started.';
        gsomniaStatus.style.color = '#ffd700';
        await checkGsomniaEligibility();
        showTransactionHash(tx.transactionHash);
    } catch (error) {
        console.error('Error executing Gsomnia:', error);
        gsomniaStatus.textContent = 'Gsomnia Failed: ' + error.message;
        gsomniaStatus.style.color = '#ff4500';
        gsomniaButton.disabled = false;
    }
}

async function mintNFT(level) {
    if (!contract || !accounts) {
        console.error('Wallet not connected');
        alert('Wallet not connected. Please connect MetaMask.');
        return;
    }
    try {
        const tokenURI = `https://ipfs.io/ipfs/QmLevel${level}NFTMetadata`; // Replace with actual IPFS metadata URI
        console.log(`Minting NFT for Level ${level}, player: ${accounts[0]}`);
        mintNFTButton.disabled = true;
        const tx = await contract.methods.mintLevelNFT(accounts[0], tokenURI).send({ from: accounts[0] });
        console.log('NFT Minted:', tx);
        gameState.nftMintedForLevel[level] = true;
        nextLevelButton.disabled = false;
        showTransactionHash(tx.transactionHash);
    } catch (error) {
        console.error('Error minting NFT:', error);
        alert('Failed to mint NFT: ' + error.message);
        mintNFTButton.disabled = false;
    }
}

function showTransactionHash(hash) {
    transactionHashDisplay.textContent = `Transaction Hash: ${hash}`;
    transactionModal.style.display = 'flex';
}

// Event Listeners for Blockchain
connectWalletButton.addEventListener('click', connectWallet);
gsomniaButton.addEventListener('click', executeGsomnia);

mintNFTButton.addEventListener('click', () => {
    mintNFT(gameState.currentLevel);
});

nextLevelButton.addEventListener('click', () => {
    gameState.current = 'play';
    levelCompleteModal.style.display = 'none';
    gameContainer.style.display = 'block';
    loadLevel(gameState.currentLevel);
});

closeTransactionModal.addEventListener('click', () => {
    transactionModal.style.display = 'none';
});

// Event Listeners for Game
document.addEventListener('keydown', (e) => {
    gameState.keys[e.code] = true;
    console.log(`Key pressed: ${e.code}`);
    if (e.code === 'KeyP' && gameState.current === 'play') {
        gameState.current = 'paused';
        gameContainer.style.display = 'none';
        pauseScreen.style.display = 'block';
        console.log('Game paused');
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.code] = false;
    console.log(`Key released: ${e.code}`);
});

startButton.addEventListener('click', () => {
    console.log('Start button clicked');
    gameState.current = 'play';
    startScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    loadLevel(gameState.currentLevel);
});

resumeButton.addEventListener('click', () => {
    console.log('Resume button clicked');
    gameState.current = 'play';
    pauseScreen.style.display = 'none';
    gameContainer.style.display = 'block';
});

pauseButton.addEventListener('click', () => {
    console.log('Pause button clicked');
    gameState.current = 'paused';
    gameContainer.style.display = 'none';
    pauseScreen.style.display = 'block';
});

restartButton.addEventListener('click', () => {
    console.log('Restart button clicked');
    gameState.current = 'play';
    gameOverScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    gameState.score = 0;
    gameState.currentLevel = 1;
    gameState.nftMintedForLevel = {};
    scoreDisplay.textContent = `Score: ${gameState.score}`;
    loadLevel(gameState.currentLevel);
});

// Collision Detection
function collides(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Update Game State
function update() {
    if (gameState.current !== 'play') {
        console.log(`Game state is ${gameState.current}, skipping update`);
        return;
    }

    // Player Movement
    let moving = false;
    if (gameState.keys['ArrowLeft']) {
        player.velX -= player.speed * 0.2;
        player.facingRight = false;
        moving = true;
    }
    if (gameState.keys['ArrowRight']) {
        player.velX += player.speed * 0.2;
        player.facingRight = true;
        moving = true;
    }

    // Jump Logic
    const currentTime = Date.now();
    if (gameState.keys['Space'] && player.onGround && (currentTime - gameState.lastJumpTime) > JUMP_COOLDOWN) {
        player.velY = JUMP_FORCE;
        player.jumping = true;
        player.onGround = false;
        gameState.lastJumpTime = currentTime;
        console.log('Player jumped');
    }

    // Apply Friction and Clamp Velocity
    player.velX *= FRICTION;
    if (Math.abs(player.velX) < 0.1) player.velX = 0;
    player.velX = Math.max(-player.speed, Math.min(player.speed, player.velX));

    // Apply Gravity
    player.velY += GRAVITY;
    player.y += player.velY;
    player.x += player.velX;

    // Reset onGround Before Collision Checks
    player.onGround = false;

    // Platform Collision
    for (let platform of platforms) {
        if (collides(player, platform)) {
            if (player.velY > 0 && player.y + player.height - player.velY <= platform.y + 5) {
                player.y = platform.y - player.height;
                player.velY = 0;
                player.jumping = false;
                player.onGround = true;
            } else if (player.velY < 0 && player.y - player.velY >= platform.y + platform.height - 5) {
                player.y = platform.y + platform.height;
                player.velY = 0;
            } else if (player.velX > 0 && player.x + player.width - player.velX <= platform.x + 5) {
                player.x = platform.x - player.width;
                player.velX = 0;
            } else if (player.velX < 0 && player.x - player.velX >= platform.x + platform.width - 5) {
                player.x = platform.x + platform.width;
                player.velX = 0;
            }
        }
    }

    // Boundary Checks
    if (player.x < 0) {
        player.x = 0;
        player.velX = 0;
    }
    if (player.x > LEVEL_WIDTH - player.width) {
        player.x = LEVEL_WIDTH - player.width;
        player.velX = 0;
    }
    if (player.y > canvas.height) {
        console.log('Player fell off the screen');
        gameState.current = 'gameOver';
        gameContainer.style.display = 'none';
        gameOverScreen.style.display = 'block';
        finalScoreDisplay.textContent = `Final Score: ${gameState.score}`;
    }
    if (player.y < 0) {
        player.y = 0;
        player.velY = 0;
    }

    // Camera Follow
    gameState.targetCameraX = Math.max(0, player.x - canvas.width / 3);
    gameState.targetCameraX = Math.min(gameState.targetCameraX, LEVEL_WIDTH - canvas.width);
    gameState.cameraX += (gameState.targetCameraX - gameState.cameraX) * CAMERA_SPEED;

    // Enemy Movement and Collision
    for (let enemy of enemies) {
        if (!enemy.alive) continue;

        enemy.x += ENEMY_SPEED * enemy.direction;
        if (enemy.x < 0 || enemy.x > LEVEL_WIDTH - enemy.width) {
            enemy.direction *= -1;
        }
        let enemyOnGround = false;
        for (let platform of platforms) {
            if (collides(enemy, platform) && enemy.y + enemy.height - ENEMY_SPEED <= platform.y + 5) {
                enemy.y = platform.y - enemy.height;
                enemyOnGround = true;
                break;
            }
        }
        if (!enemyOnGround) {
            enemy.y += GRAVITY;
        }

        // Player-Enemy Collision
        if (collides(player, enemy)) {
            if (player.velY > 0 && player.y + player.height - player.velY <= enemy.y + 5) {
                enemy.alive = false;
                gameState.score += ENEMY_DEFEAT_SCORE;
                scoreDisplay.textContent = `Score: ${gameState.score}`;
                player.velY = JUMP_FORCE / 2;
                console.log(`Enemy defeated, new score: ${gameState.score}`);
            } else {
                console.log('Player hit by enemy');
                player.alive = false;
                gameState.current = 'gameOver';
                gameContainer.style.display = 'none';
                gameOverScreen.style.display = 'block';
                finalScoreDisplay.textContent = `Final Score: ${gameState.score}`;
            }
        }
    }

    // Coin Collection
    for (let coin of coins) {
        if (!coin.collected && collides(player, coin)) {
            coin.collected = true;
            gameState.score += COIN_SCORE;
            scoreDisplay.textContent = `Score: ${gameState.score}`;
            console.log(`Coin collected, new score: ${gameState.score}`);
        }
    }

    // Level End
    if (endFlag && collides(player, endFlag)) {
        console.log(`Level ${gameState.currentLevel} completed`);
        gameState.current = 'levelComplete';
        gameContainer.style.display = 'none';
        levelCompleteModal.style.display = 'flex';
        levelCompleteTitle.textContent = `Level ${gameState.currentLevel} Completed!`;
        mintNFTButton.disabled = gameState.nftMintedForLevel[gameState.currentLevel] || false;
        nextLevelButton.disabled = !gameState.nftMintedForLevel[gameState.currentLevel];
        gameState.currentLevel++;
        if (gameState.currentLevel > levels.length) {
            gameState.current = 'gameOver';
            levelCompleteModal.style.display = 'none';
            gameOverScreen.style.display = 'block';
            finalScoreDisplay.textContent = `Final Score: ${gameState.score} - You Win!`;
        }
    }

    // Player Animation
    player.frameTimer++;
    if (player.frameTimer >= player.frameSpeed && moving) {
        player.frame = (player.frame + 1) % player.frameCount;
        player.frameTimer = 0;
    } else if (!moving) {
        player.frame = 0;
    }
}

// Render Game
function render() {
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    try {
        const bgWidth = backgroundImage.width || canvas.width;
        const bgX = -(gameState.cameraX * 0.5) % bgWidth;
        ctx.drawImage(backgroundImage, bgX, 0, bgWidth, canvas.height);
        ctx.drawImage(backgroundImage, bgX + bgWidth, 0, bgWidth, canvas.height);
    } catch (e) {
        console.error('Error drawing background:', e);
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    for (let platform of platforms) {
        if (platform.type === 'ground') {
            ctx.fillStyle = '#228b22';
            ctx.fillRect(platform.x - gameState.cameraX, platform.y, platform.width, platform.height);
        } else {
            try {
                ctx.drawImage(blockSprite, platform.x - gameState.cameraX, platform.y, platform.width, platform.height);
            } catch (e) {
                console.error('Error drawing block:', e);
                ctx.fillStyle = '#d2691e';
                ctx.fillRect(platform.x - gameState.cameraX, platform.y, platform.width, platform.height);
            }
        }
    }

    if (player.alive) {
        try {
            if (player.loaded) {
                const frameWidth = player.sprite.width / player.frameCount;
                if (player.facingRight) {
                    ctx.drawImage(
                        player.sprite,
                        player.frame * frameWidth, 0, frameWidth, player.sprite.height,
                        player.x - gameState.cameraX, player.y, player.width, player.height
                    );
                } else {
                    ctx.save();
                    ctx.scale(-1, 1);
                    ctx.drawImage(
                        player.sprite,
                        player.frame * frameWidth, 0, frameWidth, player.sprite.height,
                        -(player.x - gameState.cameraX + player.width), player.y, player.width, player.height
                    );
                    ctx.restore();
                }
            } else {
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(player.x - gameState.cameraX, player.y, player.width, player.height);
            }
        } catch (e) {
            console.error('Error drawing player:', e);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(player.x - gameState.cameraX, player.y, player.width, player.height);
        }
    }

    for (let enemy of enemies) {
        if (!enemy.alive) continue;
        try {
            ctx.drawImage(goombaSprite, enemy.x - gameState.cameraX, enemy.y, enemy.width, enemy.height);
        } catch (e) {
            console.error('Error drawing enemy:', e);
            ctx.fillStyle = '#8b0000';
            ctx.fillRect(enemy.x - gameState.cameraX, enemy.y, enemy.width, enemy.height);
        }
    }

    for (let coin of coins) {
        if (!coin.collected) {
            try {
                ctx.drawImage(coinSprite, coin.x - gameState.cameraX, coin.y, coin.width, coin.height);
            } catch (e) {
                console.error('Error drawing coin:', e);
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(coin.x - gameState.cameraX + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    if (endFlag) {
        ctx.fillStyle = '#ff4500';
        ctx.fillRect(endFlag.x - gameState.cameraX, endFlag.y, endFlag.width, endFlag.height);
    }
}

// Main Game Loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start Game
console.log('Game initializing...');
gameLoop();