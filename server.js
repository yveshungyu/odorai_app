const WebSocket = require('ws');

// 建立一個 WebSocket 伺服器，監聽在 port 8080，允許局域網訪問
const wss = new WebSocket.Server({ 
    port: 8080,
    host: '0.0.0.0' // 監聽所有網路介面
});

console.log('WebSocket 伺服器已啟動，監聽於 ws://0.0.0.0:8080 (支援局域網訪問)');

// 當有新的客戶端連線時觸發
wss.on('connection', ws => {
    console.log('一個新的客戶端已連線。');

    // 當伺服器從該客戶端收到訊息時觸發
    ws.on('message', message => {
        // 因為收到的訊息可能是 Buffer 格式，先轉換成字串
        const messageString = message.toString();
        console.log('收到訊息 => %s', messageString);

        // 我們要把這個訊息廣播給所有連線的客戶端
        wss.clients.forEach(client => {
            // 只有當客戶端處於開啟狀態時才發送
            if (client.readyState === WebSocket.OPEN) {
                client.send(messageString);
            }
        });
    });

    // 當連線關閉時觸發
    ws.on('close', () => {
        console.log('一個客戶端已斷線。');
    });

    // 當發生錯誤時觸發
    ws.on('error', (error) => {
        console.error('WebSocket 發生錯誤: ', error);
    });
});
