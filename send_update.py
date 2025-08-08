import websocket
import json
import time

def send_image_update(device_id, image_name):
    """
    連線到 WebSocket 伺服器並發送圖片更新訊息。

    :param device_id: 裝置的 ID (例如 '1' 或 '2')
    :param image_name: 新圖片的檔案名稱 (例如 'new_image_a.png')
    """
    # *** 重要 ***
    # 請將 'localhost' 換成您執行 server.js 的電腦的區域網路 IP 位址
    # 例如: 'ws://192.168.1.100:8080'
    ws_url = "ws://192.168.137.1:8080"
    
    try:
        # 建立一個 WebSocket 連線
        ws = websocket.create_connection(ws_url)
        print(f"成功連線到伺服器: {ws_url}")
        
        # 準備要發送的資料
        message = {
            "deviceId": str(device_id),
            "newImage": image_name
        }
        
        # 將資料轉換成 JSON 字串格式
        json_message = json.dumps(message)
        
        # 發送訊息
        ws.send(json_message)
        print(f"已發送訊息: {json_message}")
        
        # 關閉連線
        ws.close()
        print("連線已關閉。")
        
    except Exception as e:
        print(f"連線或發送訊息時發生錯誤: {e}")

# --- 這是一個使用範例 ---
if __name__ == "__main__":
    # 假設這是您的 Raspberry Pi #1
    # 當您要更換螢幕圖片時，就呼叫這個函式
    # 範例：將 Pi #1 的圖片換成 'lamp.png'
    send_image_update(device_id=1, image_name="lamp.png")
    
    time.sleep(2)
    
    # 假設這是您的 Raspberry Pi #2
    # 範例：將 Pi #2 的圖片換成 'relax_color.png'
    send_image_update(device_id=2, image_name="relax_color.png")
