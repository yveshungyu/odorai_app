# 🏠 客廳背景圖片設置指南

## 📁 添加新的PNG背景

### 1. 圖片放置位置
將你的PNG背景圖片放在：
```
assets/images/
```

### 2. 建議的檔案命名
- `LivingRoom-bg.png` - 客廳背景（預設）
- `MasterBedroom-bg.png` - 主臥背景
- `SecondBedroom-bg.png` - 次臥背景

### 3. 圖片尺寸建議
- **解析度**: 800x600px 或更高
- **比例**: 4:3 或 16:10 
- **格式**: PNG（支援透明度）
- **檔案大小**: 建議 < 2MB

## 🎨 在CSS中設置背景

在 `style.css` 檔案中找到這段代碼：

```css
/* 背景切換功能 - 根據不同模式使用不同背景 */
.room-background.mode-relax {
    background-image: url('./assets/images/LivingRoom-bg.png');
}

.room-background.mode-focus {
    background-image: url('./assets/images/LivingRoom-bg.png');
    filter: hue-rotate(180deg) saturate(1.2) brightness(1.05);
}

.room-background.mode-energize {
    background-image: url('./assets/images/LivingRoom-bg.png');
    filter: hue-rotate(60deg) saturate(1.3) brightness(1.1);
}
```

## 📍 調整設備圖標位置

如果你的PNG背景佈局不同，可以在 `index.html` 中調整設備位置：

```html
<!-- 例子：機器人設備位置 -->
<div class="room-device robot-device" data-device="diffuser" 
     style="top: 60%; left: 30%;">
    <div class="device-icon">🤖</div>
    <div class="device-status active"></div>
</div>
```

### 位置參考：
- `top/bottom`: 0% (頂部) 到 100% (底部)
- `left/right`: 0% (左側) 到 100% (右側)

## 🎯 設備圖標建議位置

根據你的房間背景，建議將設備放在：
- **機器人設備** (🤖): 客廳中央附近
- **燈具設備** (💡): 房間角落或檯燈旁
- **音響設備** (🔊): 電視櫃或娛樂區域

## 🖼️ 背景圖片設計建議

1. **視角**: 等距視角 (isometric) 效果最佳
2. **風格**: 現代簡約，色調柔和
3. **元素**: 包含沙發、桌子、植物等家具
4. **留白**: 預留空間放置設備圖標
5. **對比**: 確保設備圖標在背景上清晰可見

## 🔧 測試你的背景

1. 將PNG檔案放入 `assets/images/` 資料夾
2. 啟動本地服務器: `python -m http.server 8000`
3. 在瀏覽器中打開: `http://localhost:8000`
4. 切換到第三頁（Spatial Page）查看效果
5. 🏠 **房間切換**: 在第三頁左右滑動切換房間
6. 🔵 **導航點**: 查看底部三個點的切換效果

## 🏠 房間切換功能

### 🎯 三個房間
- **客廳** (🏠): LivingRoom-bg.png - 預設房間
- **主臥** (🛏️): MasterBedroom-bg.png - 第二個房間  
- **次臥** (🛌): SecondBedroom-bg.png - 第三個房間

### 📱 操作方式
- **左右滑動**: 在第三頁背景區域滑動切換房間
- **導航點**: 底部三個點顯示當前房間位置
- **自動切換**: 背景圖片會根據選擇的房間自動切換

## ✨ 進階功能

### 動態背景切換
你可以添加JavaScript來動態切換背景：

```javascript
// 在 app.js 中添加
changeBackground(imagePath) {
    const roomBg = document.querySelector('.room-background');
    roomBg.style.backgroundImage = `url('${imagePath}')`;
}
```

### 背景濾鏡效果
使用CSS濾鏡為同一張圖片創造不同氛圍：

```css
.room-background.mode-night {
    filter: brightness(0.7) saturate(0.8) hue-rotate(240deg);
}
```

---

🎉 **恭喜！** 你現在可以使用自己的PNG背景圖片了！ 