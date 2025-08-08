# smart_gif_emotion_fer_little_smooth.py
# 修復動畫卡頓問題：使用線程分離表情檢測與動畫渲染
# 關鍵改進：動畫渲染與表情檢測完全分離，確保動畫永不停頓

# ============================
# ⚙️ 裝置設定 (請在這裡修改)
# ============================
# 將此數字設定為 1 或 2，來區分不同的 Raspberry Pi
DEVICE_ID = 1
# ============================

import os
os.environ["SDL_VIDEODRIVER"] = "x11"
os.environ["DISPLAY"] = ":0"

import pygame
import time
import cv2
import RPi.GPIO as GPIO
from datetime import datetime
import pytz
import random
import threading
from queue import Queue, Empty
from send_update import send_image_update

# ============================
# 1. GPIO 設定 (Pump 與 Humidifier)
# ============================
relay_pump1 = 17    # Pump 1
relay_pump2 = 27    # Pump 2
relay_pump3 = 22    # Pump 3
relay_humidifier = 23  # Humidifier

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(relay_pump1, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(relay_pump2, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(relay_pump3, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(relay_humidifier, GPIO.OUT, initial=GPIO.HIGH)
print("✅ GPIO 初始化完成")

# ============================
# 2. Pygame 初始化（桌面環境）
# ============================
pygame.init()
screen_width = 480
screen_height = 800
screen = pygame.display.set_mode((screen_width, screen_height), pygame.NOFRAME | pygame.FULLSCREEN)
pygame.display.set_caption("Smart GIF Emotion")
pygame.mouse.set_visible(False)  # 隱藏鼠標游標
clock = pygame.time.Clock()  # 控制幀率

base_image_folder = "/home/pi/gif_frames/"

def load_images(set_name):
    image_folder = os.path.join(base_image_folder, set_name)
    images = sorted([f for f in os.listdir(image_folder) if f.endswith(".png")])
    frames = []
    for img in images:
        image = pygame.image.load(os.path.join(image_folder, img))
        scaled_image = pygame.transform.scale(image, (screen_width, screen_height))
        frames.append(scaled_image)
    return frames

# 預載所有表情的 PNG
emotion_sets = {
    'happy': 'set1',
    'angry': 'set2',
    'sad': 'set3',
    'neutral': 'set4',
    'surprised': 'set5',
    'sleepy': 'set6',
    'bored': 'set7',
    'undetected': 'set8'
}
preloaded_frames = {key: load_images(value) for key, value in emotion_sets.items()}

# ============================
# 3. 線程安全的表情狀態管理
# ============================
class EmotionState:
    def __init__(self):
        self.current_emotion = "happy"
        self.frames = preloaded_frames['happy']
        self.frame_index = 0
        self.lock = threading.Lock()

    def update_emotion(self, new_emotion):
        with self.lock:
            if new_emotion != self.current_emotion and new_emotion in preloaded_frames:
                self.current_emotion = new_emotion
                self.frames = preloaded_frames[new_emotion]
                self.frame_index = 0
                print(f"🎭 切換表情: {new_emotion}")

                # --- 從這裡開始是新增的程式碼 ---
                try:
                    set_name = emotion_sets.get(new_emotion)
                    if set_name:
                        set_number = set_name.replace('set', '')
                        
                        # 根據 DEVICE_ID 決定圖片名稱的前綴
                        image_prefix = "prototype" if DEVICE_ID == 1 else "bub"
                        new_image_filename = f"{image_prefix}{set_number}.png"
                        
                        # 使用 DEVICE_ID 發送更新通知
                        threading.Thread(target=send_image_update, args=(DEVICE_ID, new_image_filename), daemon=True).start()
                        print(f"🚀 [裝置 #{DEVICE_ID}] 已發送 WebSocket 更新: {new_image_filename}")

                except Exception as e:
                    print(f"❌ 發送 WebSocket 更新時發生錯誤: {e}")
                # --- 新增程式碼結束 ---

    def get_current_frame(self):
        with self.lock:
            if self.frames:
                current_frame = self.frames[self.frame_index]
                self.frame_index = (self.frame_index + 1) % len(self.frames)
                return current_frame
            return None

emotion_state = EmotionState()

# ============================
# 4. 表情檢測線程（背景運行）
# ============================
class EmotionDetectorThread(threading.Thread):
    def __init__(self, emotion_state):
        super().__init__()
        self.emotion_state = emotion_state
        self.running = True
        self.daemon = True  # 主程序結束時自動結束
        self.setup_detection()

    def setup_detection(self):
        # OpenCV 設定
        haar_path = "/usr/share/opencv4/haarcascades/"
        self.face_cascade = cv2.CascadeClassifier(haar_path + 'haarcascade_frontalface_default.xml')
        self.mouth_cascade = cv2.CascadeClassifier(haar_path + 'haarcascade_smile.xml')
        self.eyes_cascade = cv2.CascadeClassifier(haar_path + 'haarcascade_eye.xml')

        # 攝影機設定
        self.cap = cv2.VideoCapture(0)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        self.cap.set(cv2.CAP_PROP_FORMAT, cv2.CV_8UC3)
   # 檢測參數
        self.no_eye_frame_count = 0
        self.no_mouth_frame_count = 0
        self.angry_threshold = 3
        self.sleepy_threshold = 4
        self.bored_threshold = 5
        self.emotion_counter = 0
        self.last_emotion = None

    def detect_emotion_opencv(self, frame):
        if len(frame.shape) == 2:
            gray = frame
        else:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.005, minNeighbors=1, minSize=(10, 10))

        if len(faces) > 0:
            x, y, w, h = faces[0]
            aspect_ratio = h / w
            roi_gray = gray[y:y+h, x:x+w]
            mouths = self.mouth_cascade.detectMultiScale(roi_gray, 1.05, 1)
            eyes = self.eyes_cascade.detectMultiScale(roi_gray, 1.03, 1)

            if len(eyes) == 0:
                self.no_eye_frame_count += 1
            else:
                self.no_eye_frame_count = 0

            if len(mouths) == 0:
                self.no_mouth_frame_count += 1
            else:
                self.no_mouth_frame_count = 0

            # 表情判斷
            if len(mouths) >= 1 or aspect_ratio < 1.3:
                emotion = "happy"
                score = 0.97
            elif aspect_ratio > 1.3:
                emotion = "surprised"
                score = 0.90
            elif self.no_eye_frame_count >= self.angry_threshold and len(eyes) == 0:
                emotion = "angry"
                score = 0.80
            elif self.no_eye_frame_count >= self.sleepy_threshold:
                emotion = "sleepy"
                score = 0.95
            elif self.no_mouth_frame_count >= self.bored_threshold:
                emotion = "bored"
                score = 0.85
            else:
                emotion = "neutral"
                score = 0.70

            # 處理連續相同表情
            if emotion == self.last_emotion:
                self.emotion_counter += 1
            else:
                self.emotion_counter = 1
                self.last_emotion = emotion

            if self.emotion_counter >= 4:
                available_emotions = ["happy", "angry", "neutral", "sad", "surprised", "bored"]
                weights = [0.4, 0.15, 0.15, 0.15, 0.1, 0.05]
                if self.last_emotion in available_emotions:
                    idx = available_emotions.index(self.last_emotion)
                    available_emotions.pop(idx)
                    total_weight = sum(weights) - weights[idx]
                    weights = [w / total_weight for w in weights if w != weights[idx]]
                emotion = random.choices(available_emotions, weights=weights, k=1)[0]
                score = 0.5
                self.emotion_counter = 1
                self.last_emotion = emotion

            return emotion, score
        else:
            emotion = "undetected"
            score = 0.5

            # 處理連續undetected
            if emotion == self.last_emotion:
                self.emotion_counter += 1
            else:
                self.emotion_counter = 1
                self.last_emotion = emotion

            if self.emotion_counter >= 4:
                available_emotions = ["happy", "angry", "neutral", "sad", "surprised", "bored"]
                weights = [0.4, 0.15, 0.15, 0.15, 0.1, 0.05]
                emotion = random.choices(available_emotions, weights=weights, k=1)[0]
                score = 0.5
                self.emotion_counter = 1
                self.last_emotion = emotion

            return emotion, score

    def run(self):
        print("🔄 表情檢測線程啟動")
        last_detect_time = time.time()
        detect_interval = 2.0  # 每2秒檢測一次

        while self.running:
            try:
                now = time.time()
                if now - last_detect_time >= detect_interval:
                    ret, frame = self.cap.read()
                    if ret:
                        emotion, score = self.detect_emotion_opencv(frame)
                        self.emotion_state.update_emotion(emotion)
                        print(f"🎭 檢測結果: {emotion} ({score:.2f})")
                    last_detect_time = now

                time.sleep(0.1)  # 避免CPU過載

            except Exception as e:
                print(f"❌ 表情檢測錯誤: {e}")
                time.sleep(1)

    def stop(self):
        self.running = False
        if hasattr(self, 'cap'):
            self.cap.release()

# ============================
# 5. GPIO 控制函式
# ============================
def activate_pumps(pump1=False, pump2=False, pump3=False, duration=10):
    GPIO.output(relay_pump1, GPIO.HIGH if pump1 else GPIO.LOW)
    GPIO.output(relay_pump2, GPIO.HIGH if pump2 else GPIO.LOW)
    GPIO.output(relay_pump3, GPIO.HIGH if pump3 else GPIO.LOW)
    time.sleep(duration)
    GPIO.output(relay_pump1, GPIO.LOW)
    GPIO.output(relay_pump2, GPIO.LOW)
    GPIO.output(relay_pump3, GPIO.LOW)

def trigger_humidifier(duration=0.5):
    GPIO.output(relay_humidifier, GPIO.LOW)
    time.sleep(duration)
    GPIO.output(relay_humidifier, GPIO.HIGH)

# ============================
# 6. 主循環（純動畫渲染）
# ============================
def main():
    # 啟動表情檢測線程
    detector_thread = EmotionDetectorThread(emotion_state)
    detector_thread.start()

    # 自動觸發設定
    auto_trigger_map = {
        6: (True, False, False),    # Pump1
        9: (True, True, False),     # Pump1+2
        14: (False, True, False),   # Pump2
        19: (False, True, True),    # Pump2+3
        22: (False, False, True),   # Pump3
    }
    last_triggered_hour = -1

    manual_emoji_keys = {
        pygame.K_a: 'happy',
        pygame.K_s: 'angry',
        pygame.K_d: 'sad',
        pygame.K_f: 'neutral',
        pygame.K_g: 'surprised',
        pygame.K_h: 'sleepy',
        pygame.K_j: 'bored',
        pygame.K_k: 'undetected'
    }

    running = True
    print("✅ 主循環啟動 - 動畫將持續流暢播放")

    try:
        while running:
            # 處理事件（不阻塞）
            for event in pygame.event.get():
                if event.type == pygame.KEYDOWN:
                    if event.key in manual_emoji_keys:
                        emotion_state.update_emotion(manual_emoji_keys[event.key])
                    elif event.key == pygame.K_1:
                        threading.Thread(target=activate_pumps, args=(True,), daemon=True).start()
                    elif event.key == pygame.K_2:
                        threading.Thread(target=activate_pumps, args=(True, True), daemon=True).start()
                    elif event.key == pygame.K_3:
                        threading.Thread(target=activate_pumps, args=(False, True), daemon=True).start()
                    elif event.key == pygame.K_4:
                        threading.Thread(target=activate_pumps, args=(False, True, True), daemon=True).start()
                    elif event.key == pygame.K_5:
                        threading.Thread(target=activate_pumps, args=(False, False, True), daemon=True).start()
                    elif event.key == pygame.K_9:
                        threading.Thread(target=trigger_humidifier, daemon=True).start()
                    elif event.key == pygame.K_q or event.key == pygame.K_ESCAPE:
                        running = False
                elif event.type == pygame.QUIT:
                    running = False

            # 自動觸發檢查（非阻塞）
            la_time = datetime.now(pytz.timezone('America/Los_Angeles'))
            if la_time.hour in auto_trigger_map and la_time.hour != last_triggered_hour:
                pump1, pump2, pump3 = auto_trigger_map[la_time.hour]
                print(f"🕒 自動觸發：{la_time.strftime('%H:%M')}")
                threading.Thread(target=activate_pumps, args=(pump1, pump2, pump3, 5), daemon=True).start()
                threading.Thread(target=trigger_humidifier, daemon=True).start()
                last_triggered_hour = la_time.hour

            # 動畫渲染（永不阻塞）
            current_frame = emotion_state.get_current_frame()
            if current_frame:
                screen.blit(current_frame, (0, 0))
                pygame.display.flip()

            # 控制幀率：5 FPS = 每張圖片顯示 0.2 秒
            clock.tick(5)

    except KeyboardInterrupt:
        print("\n🛑 程序中斷")
    finally:
        # 清理資源
        print("🧹 清理資源...")
        detector_thread.stop()
        detector_thread.join(timeout=2)
        cv2.destroyAllWindows()
        pygame.quit()
        GPIO.cleanup()
        print("✅ 清理完成")

if __name__ == "__main__":
    main()
