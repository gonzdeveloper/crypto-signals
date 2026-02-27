const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const TELEGRAM_BOT_TOKEN = '8662764953:AAGPF6_1av3rdWNQIn32k9raNsWdHi36sdA';

const configFile = path.join(__dirname, 'config.json');
function loadConfig() {
    try {
        if (fs.existsSync(configFile)) {
            return JSON.parse(fs.readFileSync(configFile, 'utf8'));
        }
    } catch(e) {}
    return { telegramChatId: null, lastSignals: {} };
}
function saveConfig(config) {
    try {
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    } catch(e) {}
}

const initialConfig = loadConfig();
let telegramChatId = initialConfig.telegramChatId;
let lastSignals = initialConfig.lastSignals || {};

const BINANCE_API = process.env.BINANCE_API || 'https://api.binance.com';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const CRYPTOCOMPARE_API = 'https://min-api.cryptocompare.com/data';

const symbols = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
    'ADAUSDT', 'DOGEUSDT', 'DOTUSDT', 'AVAXUSDT', 'MATICUSDT',
    'LINKUSDT', 'LTCUSDT', 'UNIUSDT', 'ATOMUSDT', 'ETCUSDT',
    'XLMUSDT', 'NEARUSDT', 'ALGOUSDT', 'FILUSDT', 'APTUSDT',
    'ARBUSDT', 'OPUSDT', 'SANDUSDT', 'MANAUSDT', 'AAVEUSDT',
    'AXSUSDT', 'FTMUSDT', 'THETAUSDT', 'EOSUSDT', 'XTZUSDT',
    'APEUSDT', 'LDOUSDT', 'INJUSDT', 'SUIUSDT', 'SEIUSDT',
    'TIAUSDT', 'PEPEUSDT', 'WIFUSDT', 'BONKUSDT', 'FETUSDT',
    'RNDRUSDT', 'GRTUSDT', 'IMXUSDT', 'RUNEUSDT', 'ENSUSDT',
    'MASKUSDT', 'DYDXUSDT', 'GALAUSDT', 'MINAUSDT', 'ZECUSDT',
    'DASHUSDT', 'NEOUSDT', 'KAVAUSDT', 'COMPUSDT', 'MKRUSDT',
    'SNXUSDT', 'CRVUSDT', 'YFIUSDT', 'SUSHIUSDT', '1INCHUSDT',
    'CHZUSDT', 'ENJUSDT', 'SXPUSDT', 'CELOUSDT', 'BATUSDT',
    'ZILUSDT', 'ENBUSDT', 'ANKRUSDT', 'ICXUSDT', 'STORJUSDT',
    'RENUSDT', 'KNCUSDT', 'REEFUSDT', 'OGNUSDT', 'BANDUSDT',
    'SXPUSDT', 'CTSIUSDT', 'LRCUSDT', 'ONEUSDT', 'ZRXUSDT',
    'SKLUSDT', 'CROUSDT', 'RSRUSDT', 'BELUSDT', 'WAVESUSDT',
    'ANTUSDT', 'SUNUSDT', 'TRXUSDT', 'WINUSDT', 'BTTUSDT',
    'HOTUSDT', 'TUSDUSDT', 'USDCUSDT', 'USDPUSDT', 'PAXGUSDT',
    'WBTCUSDT', 'WBETHUSDT', 'ETHWUSDT', 'ETHFUSDT', 'BTCBUSDT',
    'BTCUSDC', 'ETHUSDC', 'STETHUSDT', 'METHUSDT', 'ANKRETHUSDT',
    'CBETHUSDT', 'RETHUSDT', 'SWETHUSDT', 'MVERUSDT', 'CSETHUSDT',
    'PYTHUSDT', 'RONINUSDT', 'BLURUSDT', 'GMXUSDT', 'LDOUSDT',
    'HOOKUSDT', 'SSVUSDT', 'LQTYUSDT', 'RDNTUSDT', 'PENDLEUSDT',
    'JASMYUSDT', 'HOQUUSDT', 'FRONTUSDT', 'DODOUSDT', 'ZRXUSDT',
    'CELRUSDT', 'NKNUSDT', 'RSKUSDT', 'NULSUSDT', 'TWTUSDT',
    'JOEUSDT', 'GFIUSDT', 'RAYSUSDT', 'KDAUSDT', 'KMAUSDT'
];

const cryptoNames = {
    'BTCUSDT': { name: 'Bitcoin', short: 'BTC' },
    'ETHUSDT': { name: 'Ethereum', short: 'ETH' },
    'BNBUSDT': { name: 'BNB', short: 'BNB' },
    'SOLUSDT': { name: 'Solana', short: 'SOL' },
    'XRPUSDT': { name: 'XRP', short: 'XRP' },
    'ADAUSDT': { name: 'Cardano', short: 'ADA' },
    'DOGEUSDT': { name: 'Dogecoin', short: 'DOGE' },
    'DOTUSDT': { name: 'Polkadot', short: 'DOT' },
    'AVAXUSDT': { name: 'Avalanche', short: 'AVAX' },
    'MATICUSDT': { name: 'Polygon', short: 'MATIC' },
    'LINKUSDT': { name: 'Chainlink', short: 'LINK' },
    'LTCUSDT': { name: 'Litecoin', short: 'LTC' },
    'UNIUSDT': { name: 'Uniswap', short: 'UNI' },
    'ATOMUSDT': { name: 'Cosmos', short: 'ATOM' },
    'ETCUSDT': { name: 'Ethereum Classic', short: 'ETC' },
    'XLMUSDT': { name: 'Stellar', short: 'XLM' },
    'NEARUSDT': { name: 'NEAR Protocol', short: 'NEAR' },
    'ALGOUSDT': { name: 'Algorand', short: 'ALGO' },
    'FILUSDT': { name: 'Filecoin', short: 'FIL' },
    'APTUSDT': { name: 'Aptos', short: 'APT' },
    'ARBUSDT': { name: 'Arbitrum', short: 'ARB' },
    'OPUSDT': { name: 'Optimism', short: 'OP' },
    'SANDUSDT': { name: 'The Sandbox', short: 'SAND' },
    'MANAUSDT': { name: 'Decentraland', short: 'MANA' },
    'AAVEUSDT': { name: 'Aave', short: 'AAVE' },
    'AXSUSDT': { name: 'Axie Infinity', short: 'AXS' },
    'FTMUSDT': { name: 'Fantom', short: 'FTM' },
    'THETAUSDT': { name: 'Theta', short: 'THETA' },
    'EOSUSDT': { name: 'EOS', short: 'EOS' },
    'XTZUSDT': { name: 'Tezos', short: 'XTZ' },
    'APEUSDT': { name: 'ApeCoin', short: 'APE' },
    'LDOUSDT': { name: 'Lido DAO', short: 'LDO' },
    'INJUSDT': { name: 'Injective', short: 'INJ' },
    'SUIUSDT': { name: 'Sui', short: 'SUI' },
    'SEIUSDT': { name: 'Sei', short: 'SEI' },
    'TIAUSDT': { name: 'Celestia', short: 'TIA' },
    'PEPEUSDT': { name: 'Pepe', short: 'PEPE' },
    'WIFUSDT': { name: 'dogwifhat', short: 'WIF' },
    'BONKUSDT': { name: 'Bonk', short: 'BONK' },
    'FETUSDT': { name: 'Fetch.ai', short: 'FET' },
    'RNDRUSDT': { name: 'Render', short: 'RNDR' },
    'GRTUSDT': { name: 'The Graph', short: 'GRT' },
    'IMXUSDT': { name: 'Immutable', short: 'IMX' },
    'RUNEUSDT': { name: 'THORChain', short: 'RUNE' },
    'ENSUSDT': { name: 'Ethereum Name Service', short: 'ENS' },
    'MASKUSDT': { name: 'Mask Network', short: 'MASK' },
    'DYDXUSDT': { name: 'dYdX', short: 'DYDX' },
    'GALAUSDT': { name: 'Gala', short: 'GALA' },
    'MINAUSDT': { name: 'Mina', short: 'MINA' },
    'ZECUSDT': { name: 'Zcash', short: 'ZEC' },
    'DASHUSDT': { name: 'Dash', short: 'DASH' },
    'NEOUSDT': { name: 'Neo', short: 'NEO' },
    'KAVAUSDT': { name: 'Kava', short: 'KAVA' },
    'COMPUSDT': { name: 'Compound', short: 'COMP' },
    'MKRUSDT': { name: 'Maker', short: 'MKR' },
    'SNXUSDT': { name: 'Synthetix', short: 'SNX' },
    'CRVUSDT': { name: 'Curve DAO', short: 'CRV' },
    'YFIUSDT': { name: 'yearn.finance', short: 'YFI' },
    'SUSHIUSDT': { name: 'SushiSwap', short: 'SUSHI' },
    '1INCHUSDT': { name: '1inch', short: '1INCH' },
    'CHZUSDT': { name: 'Chiliz', short: 'CHZ' },
    'ENJUSDT': { name: 'Enjin Coin', short: 'ENJ' },
    'CELOUSDT': { name: 'Celo', short: 'CELO' },
    'BATUSDT': { name: 'Basic Attention', short: 'BAT' },
    'ZILUSDT': { name: 'Zilliqa', short: 'ZIL' },
    'ANKRUSDT': { name: 'Ankr', short: 'ANKR' },
    'ICXUSDT': { name: 'ICON', short: 'ICX' },
    'STORJUSDT': { name: 'Storj', short: 'STORJ' },
    'RENUSDT': { name: 'Ren', short: 'REN' },
    'KNCUSDT': { name: 'Kyber Network', short: 'KNC' },
    'REEFUSDT': { name: 'Reef', short: 'REEF' },
    'OGNUSDT': { name: 'Origin Protocol', short: 'OGN' },
    'BANDUSDT': { name: 'Band Protocol', short: 'BAND' },
    'CTSIUSDT': { name: 'Cartesi', short: 'CTSI' },
    'LRCUSDT': { name: 'Loopring', short: 'LRC' },
    'ONEUSDT': { name: 'Harmony', short: 'ONE' },
    'ZRXUSDT': { name: '0x', short: 'ZRX' },
    'SKLUSDT': { name: 'Skale', short: 'SKL' },
    'CROUSDT': { name: 'Cronos', short: 'CRO' },
    'RSRUSDT': { name: 'RSK Infrastructure', short: 'RSR' },
    'BELUSDT': { name: 'Bella Protocol', short: 'BEL' },
    'WAVESUSDT': { name: 'Waves', short: 'WAVES' },
    'ANTUSDT': { name: 'Aragon', short: 'ANT' },
    'TRXUSDT': { name: 'TRON', short: 'TRX' },
    'HOTUSDT': { name: 'Holo', short: 'HOT' },
    'PAXGUSDT': { name: 'Pax Gold', short: 'PAXG' },
    'WBTCUSDT': { name: 'Wrapped Bitcoin', short: 'WBTC' },
    'ETHWUSDT': { name: 'EthereumPoW', short: 'ETHW' },
    'PYTHUSDT': { name: 'Pyth Network', short: 'PYTH' },
    'HOOKUSDT': { name: 'Hooked Protocol', short: 'HOOK' },
    'SSVUSDT': { name: 'SSV Network', short: 'SSV' },
    'LQTYUSDT': { name: 'Liquity', short: 'LQTY' },
    'RDNTUSDT': { name: 'Radiant', short: 'RDNT' },
    'PENDLEUSDT': { name: 'Pendle', short: 'PENDLE' },
    'JASMYUSDT': { name: 'JasmyCoin', short: 'JASMY' },
    'DODOUSDT': { name: 'DODO', short: 'DODO' },
    'CELRUSDT': { name: 'Celer Network', short: 'CELR' },
    'NKNUSDT': { name: 'NKN', short: 'NKN' },
    'TWTUSDT': { name: 'Trust Wallet', short: 'TWT' },
    'JOEUSDT': { name: 'JOE', short: 'JOE' },
    'KDAUSDT': { name: 'Kadena', short: 'KDA' },
    'GMXUSDT': { name: 'GMX', short: 'GMX' },
    'LDOUSDT': { name: 'Lido DAO', short: 'LDO' },
    'BLURUSDT': { name: 'Blur', short: 'BLUR' },
    'RENUSDT': { name: 'Ren', short: 'REN' },
    'STETHUSDT': { name: 'Lido Staked ETH', short: 'STETH' },
    'IMXUSDT': { name: 'Immutable X', short: 'IMX' },
    'MASKUSDT': { name: 'Mask Network', short: 'MASK' }
};

function fetchUrl(url, retries = 2) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https://');
        const lib = isHttps ? https : http;
        const opts = isHttps ? { rejectUnauthorized: false, timeout: 15000 } : { timeout: 15000 };
        const req = lib.get(url, opts, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch(e) { 
                    console.log('Parse error:', e.message, 'Data:', data.substring(0, 100));
                    reject(e); 
                }
            });
        }).on('error', (err) => {
            console.log('HTTPS error:', err.message);
            reject(err);
        });
        req.on('timeout', () => {
            req.destroy();
            console.log('Request timeout');
            reject(new Error('Request timeout'));
        });
    });
}

const symbolToCoinId = {
    'BTCUSDT': 'bitcoin', 'ETHUSDT': 'ethereum', 'BNBUSDT': 'binancecoin',
    'SOLUSDT': 'solana', 'XRPUSDT': 'ripple', 'ADAUSDT': 'cardano',
    'DOGEUSDT': 'dogecoin', 'DOTUSDT': 'polkadot', 'AVAXUSDT': 'avalanche-2',
    'MATICUSDT': 'matic-network', 'LINKUSDT': 'chainlink', 'LTCUSDT': 'litecoin',
    'UNIUSDT': 'uniswap', 'ATOMUSDT': 'cosmos', 'ETCUSDT': 'ethereum-classic'
};

async function getPrices() {
    const priceSymbols = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'AVAX', 'MATIC', 'LINK', 'LTC', 'UNI', 'ATOM', 'ETC'];
    try {
        const fsyms = priceSymbols.join(',');
        const data = await fetchUrl(`${CRYPTOCOMPARE_API}/pricemulti?fsyms=${fsyms}&tsyms=USD`);
        const prices = {};
        const symbolMap = { 'BTC': 'BTCUSDT', 'ETH': 'ETHUSDT', 'BNB': 'BNBUSDT', 'SOL': 'SOLUSDT', 'XRP': 'XRPUSDT', 'ADA': 'ADAUSDT', 'DOGE': 'DOGEUSDT', 'DOT': 'DOTUSDT', 'AVAX': 'AVAXUSDT', 'MATIC': 'MATICUSDT', 'LINK': 'LINKUSDT', 'LTC': 'LTCUSDT', 'UNI': 'UNIUSDT', 'ATOM': 'ATOMUSDT', 'ETC': 'ETCUSDT' };
        for (const [sym, usdData] of Object.entries(data)) {
            if (usdData.USD) {
                const symbol = symbolMap[sym];
                prices[symbol] = {
                    price: usdData.USD.PRICE,
                    change: usdData.USD.CHANGE24HOUR || 0,
                    high: usdData.USD.HIGH24HOUR || usdData.USD.PRICE * 1.01,
                    low: usdData.USD.LOW24HOUR || usdData.USD.PRICE * 0.99
                };
            }
        }
        return prices;
    } catch(e) {
        console.log('CryptoCompare error:', e.message);
        return {};
    }
}

const symbolToCC = { 'BTCUSDT': 'BTC', 'ETHUSDT': 'ETH', 'BNBUSDT': 'BNB', 'SOLUSDT': 'SOL', 'XRPUSDT': 'XRP', 'ADAUSDT': 'ADA', 'DOGEUSDT': 'DOGE', 'DOTUSDT': 'DOT', 'AVAXUSDT': 'AVAX', 'MATICUSDT': 'MATIC' };
const intervalMap = { '1m': '1', '5m': '5', '15m': '15', '30m': '30', '1h': '60', '4h': '240', '1d': 'D', '1w': 'W' };

async function getKlines(symbol, interval, limit) {
    try {
        const ccSymbol = symbolToCC[symbol];
        if (!ccSymbol) return [];
        const ccInterval = intervalMap[interval] || '60';
        const data = await fetchUrl(`${CRYPTOCOMPARE_API}/histohour?fsym=${ccSymbol}&tsym=USD&limit=${limit}&aggregate=1`);
        if (data && data.Data && data.Data.Data) {
            return data.Data.Data.map(k => ({
                time: k.time,
                open: k.open,
                high: k.high,
                low: k.low,
                close: k.close
            }));
        }
        return [];
    } catch(e) {
        console.log('Klines error:', e.message);
        return [];
    }
}

function sendTelegramMessage(message) {
    if (!telegramChatId) {
        console.log('⚠️ No hay Chat ID configurado para Telegram');
        return;
    }
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${telegramChatId}&text=${encodeURIComponent(message)}&parse_mode=HTML`;
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                if (result.ok) {
                    console.log('✅ Notificación enviada a Telegram');
                } else {
                    console.log('❌ Error Telegram:', result.description);
                }
            } catch(e) {}
        });
    }).on('error', err => console.log('❌ Error conexión Telegram:', err.message));
}

function calculateRSI(prices, period = 14) {
    const rsi = [];
    for (let i = 0; i < prices.length; i++) {
        if (i < period) { rsi.push(null); continue; }
        let gains = 0, losses = 0;
        for (let j = i - period + 1; j <= i; j++) {
            const change = prices[j] - prices[j - 1];
            if (change > 0) gains += change;
            else losses -= change;
        }
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
    }
    return rsi;
}

function calculateEMA(prices, period) {
    const ema = [];
    const k = 2 / (period + 1);
    ema.push(prices[0]);
    for (let i = 1; i < prices.length; i++) {
        ema.push(prices[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
}

function calculateMACD(prices) {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine = ema12.map((v, i) => v - ema26[i]);
    const signalLine = calculateEMA(macdLine, 9);
    return { macdLine, signalLine };
}

function analyzeSignal(klines, tf) {
    if (klines.length < 60) return null;
    
    const closePrices = klines.map(k => k.close);
    const rsi = calculateRSI(closePrices);
    const currentRSI = rsi[rsi.length - 1];
    const { macdLine, signalLine } = calculateMACD(closePrices);
    const ema20 = calculateEMA(closePrices, 20);
    const ema50 = calculateEMA(closePrices, 50);
    
    const rsiDirection = currentRSI < 40 ? 'buy' : currentRSI > 60 ? 'sell' : 'neutral';
    const emaDirection = ema20[ema20.length - 1] > ema50[ema50.length - 1] ? 'buy' : 'sell';
    const macdDirection = macdLine[macdLine.length - 1] > signalLine[signalLine.length - 1] ? 'buy' : 'sell';
    
    const directions = [rsiDirection, emaDirection, macdDirection];
    const buyCount = directions.filter(d => d === 'buy').length;
    const sellCount = directions.filter(d => d === 'sell').length;
    
    if (buyCount >= 2) return { action: 'BUY', confidence: 'ALTA', rsi: currentRSI, price: closePrices[closePrices.length - 1] };
    if (sellCount >= 2) return { action: 'SELL', confidence: 'ALTA', rsi: currentRSI, price: closePrices[closePrices.length - 1] };
    
    return null;
}

const monitoredTimeframes = ['15m', '1h', '4h'];
const monitoredSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT'];

async function checkSignals() {
    if (!telegramChatId) return;
    
    for (const symbol of monitoredSymbols) {
        for (const tf of monitoredTimeframes) {
            const key = `${symbol}_${tf}`;
            try {
                const klines = await getKlines(symbol, tf, 60);
                const signal = analyzeSignal(klines, tf);
                
                if (signal && signal.confidence === 'ALTA') {
                    const lastSignal = lastSignals[key];
                    
                    if (!lastSignal || lastSignal.action !== signal.action) {
                        lastSignals[key] = signal;
                        
                        const name = cryptoNames[symbol]?.short || symbol;
                        const icon = signal.action === 'BUY' ? '🟢' : '🔴';
                        const message = 
`${icon} SEÑAL DE ${signal.action} - ${name}/USDT

⏰ Timeframe: ${tf}
💰 Precio: $${signal.price.toLocaleString()}
📊 Confianza: ${signal.confidence}

• RSI: ${signal.rsi.toFixed(1)}`;
                        
                        sendTelegramMessage(message);
                    }
                }
            } catch(e) {
                console.log(`Error monitoreando ${key}:`, e.message);
            }
        }
    }
}

const mimeTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

const server = http.createServer(async (req, res) => {
    const baseUrl = `http://${req.headers.host}`;
    const url = new URL(req.url, baseUrl);
    
    if (url.pathname === '/api/prices') {
        try {
            const prices = await getPrices();
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(prices));
        } catch(e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
    } else if (url.pathname.startsWith('/api/klines/')) {
        const symbol = url.pathname.split('/')[3];
        const interval = url.searchParams.get('interval') || '1d';
        const limit = url.searchParams.get('limit') || 365;
        try {
            const klines = await getKlines(symbol, interval, parseInt(limit));
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(klines));
        } catch(e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
    } else if (url.pathname === '/api/symbols') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(cryptoNames));
    } else if (url.pathname === '/api/telegram/setChatId') {
        const chatId = url.searchParams.get('chatId');
        if (chatId) {
            telegramChatId = chatId;
            saveConfig({ telegramChatId, lastSignals });
            console.log('✅ Chat ID de Telegram configurado:', chatId);
            sendTelegramMessage('✅ ¡Bienvenido! Recibirás notificaciones de trading cuando haya señales en 15m, 1h o 4h.');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, chatId: chatId }));
        } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'chatId requerido' }));
        }
    } else if (url.pathname === '/api/telegram/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ connected: !!telegramChatId, chatId: telegramChatId }));
    } else {
        let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
        filePath = path.join(__dirname, 'public', filePath);
        const ext = path.extname(filePath);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
                res.end(data);
            }
        });
    }
});

setInterval(checkSignals, 15 * 60 * 1000);
setTimeout(() => {
    checkSignals();
    console.log('🔔 Monitoreo de señales iniciado (15m, 1h, 4h)');
}, 5000);

const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});
