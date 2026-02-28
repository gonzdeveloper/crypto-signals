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

## USO RECOMENDADO: Local

### Para datos reales (Binance):

```bash
cd "C:\Users\gonza\Documents\Cripto"
npm install
npm start
```

Abrir **http://localhost:3000**

---

## Deployment (Requiere plan pago)

### Render.com (Plan pago necesario)

Los planes gratuitos de Render bloquean conexiones a Binance/CoinGecko. Se requiere el plan pago (~$5/mes).

1. Crear cuenta en render.com
2. New → Web Service
3. Conectar repositorio de GitHub
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Agregar Variable de Entorno: `NODE_ENV=production`

---

## Configuración Telegram

1. Ve al bot: @mis_senales_gonza_bot
2. Envía /start
3. Copia tu Chat ID
4. En la app, pega tu Chat ID en el campo de Telegram

Las notificaciones se envían cada 15 minutos cuando hay señales de ALTA confianza (≥60%) en 15m, 1h o 4h.
