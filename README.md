# Crypto Signals - Trading Charts

Aplicación de gráficos de criptomonedas en tiempo real con señales de trading.

## Características

- 📈 Gráficos de velas en tiempo real (Binance API)
- 📊 Indicadores: RSI, MACD, ADX
- 🔥 Detección de divergencias RSI
- 📉 EMAs: 20, 50, 100, 200
- 🛡️ Soporte y Resistencia
- 🎯 Señales de trading con efectividad histórica
- 📱 Notificaciones Telegram (15m, 1h, 4h)

## Deployment

### Render.com

1. Crear cuenta en render.com
2. New → Web Service
3. Conectar repositorio de GitHub
4. Build Command: (vacío)
5. Start Command: `node server.js`
6. Obtener URL (ej: crypto-signals.onrender.com)

## Uso Local

```bash
npm install
npm start
```

Abrir http://localhost:3000
