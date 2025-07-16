// 獨立氣味波物理擴散系統 - 完全按照技術說明實現
// 每個氣味波完全獨立，零干擾，按鍵控制

class ScentWave {
    /**
     * 獨立氣味波類別
     * @param {Array} position - [x, y] 位置
     * @param {string} scentType - 氣味類型 ('lavender', 'citrus', 'eucalyptus')
     * @param {Array} color - [r, g, b] 顏色
     * @param {number} intensity - 初始強度
     * @param {Array} mapShape - [height, width] 地圖尺寸
     */
    constructor(position, scentType, color, intensity = 4.0, mapShape = [150, 200]) {
        // 基本屬性
        this.position = position;
        this.scentType = scentType;
        this.color = color;
        this.intensity = intensity;
        
        // 物理參數
        this.radius = 8.5;  // 起始半徑
        this.age = 0.0;     // 氣味年齡（幀數）
        this.expansionSpeed = 8.0;  // 擴散速度
        this.decayRate = 0.992;     // 每幀衰減0.8%
        
        // 生命週期控制
        this.expansionTime = 600;   // 7秒 * 30fps = 210幀
        this.isExpanding = true;    // 是否還在擴散階段
        
        // 獨立地圖 - 每個氣味波擁有專屬的濃度地圖
        this.mapShape = mapShape;
        this.scentMap = new Float32Array(mapShape[0] * mapShape[1]);
        this.scaleFactor = 4;  // 降採樣因子
        
        console.log(`🌬️ 創建新的獨立${scentType}氣味波 - 位置: [${position[0]}, ${position[1]}]`);
    }
    
    /**
     * 更新氣味波狀態和自己的地圖 - 完全獨立運算
     */
    update() {
        this.age += 1;
        
        // 檢查是否到了5秒，停止擴散
        if (this.age >= this.expansionTime) {
            this.isExpanding = false;
        }
        
        // 只有在擴散階段才增加半徑
        if (this.isExpanding) {
            this.radius += this.expansionSpeed;
        }
        
        // 強度衰減（每幀1.5%）
        this.intensity *= this.decayRate;
        
        // 更新自己的獨立地圖
        this._updateOwnMap();
    }
    
    /**
     * 檢查氣味波是否還有效
     */
    isAlive() {
        return this.intensity > 0.05;
    }
    
    /**
     * 檢查是否在fade out階段
     */
    isInFadeOutPhase() {
        return !this.isExpanding;
    }
    
    /**
     * 更新氣味波自己的地圖 - 完全獨立，不受其他氣味波影響
     */
    _updateOwnMap() {
        // 清空自己的地圖
        this.scentMap.fill(0.0);
        
        // 計算在自己地圖中的位置
        const cx = this.position[0] / this.scaleFactor;
        const cy = this.position[1] / this.scaleFactor;
        const mapRadius = this.radius / this.scaleFactor + 1;
        
        const height = this.mapShape[0];
        const width = this.mapShape[1];
        
        // 控制計算範圍
        const minX = Math.max(0, Math.floor(cx - mapRadius));
        const maxX = Math.min(width, Math.ceil(cx + mapRadius + 1));
        const minY = Math.max(0, Math.floor(cy - mapRadius));
        const maxY = Math.min(height, Math.ceil(cy + mapRadius + 1));
        
        // 計算氣味貢獻
        const waveContribution = this.intensity * 0.06;
        
        for (let x = minX; x < maxX; x++) {
            for (let y = minY; y < maxY; y++) {
                const dx = x - cx;
                const dy = y - cy;
                const distance = Math.sqrt(dx * dx + dy * dy) * this.scaleFactor;
                
                if (distance <= this.radius) {
                    // 距離衰減
                    const fadeFactor = 1.0 - (distance / this.radius);
                    
                    // 輕微的不規則性
                    const angle = Math.atan2(dy, dx);
                    const irregularity = 1.0 + 0.15 * Math.sin(angle * 4 + this.age * 0.1);
                    
                    const concentration = waveContribution * Math.pow(fadeFactor, 1.5) * irregularity;
                    
                    // 設置濃度（限制最大值）
                    const index = y * width + x;
                    this.scentMap[index] = Math.min(concentration, 3.0);
                }
            }
        }
    }
}

class PhysicalScentSystem {
    constructor(floorplanShape = [600, 800, 3]) {
        this.floorplanShape = floorplanShape;
        this.height = floorplanShape[0];
        this.width = floorplanShape[1];
        
        // 使用降採樣提升性能
        this.scaleFactor = 4;
        this.mapHeight = Math.floor(this.height / this.scaleFactor);
        this.mapWidth = Math.floor(this.width / this.scaleFactor);
        
        // 氣味濃度地圖（顯示用）
        this.scentMaps = {
            'lavender': new Float32Array(this.mapHeight * this.mapWidth),
            'citrus': new Float32Array(this.mapHeight * this.mapWidth),
            'eucalyptus': new Float32Array(this.mapHeight * this.mapWidth)
        };
        
        // 氣味釋放器配置 - 固定位置，不論什麼模式都一樣
        this.scentDevices = {
            1: {  // 按鍵1 - 薰衣草 (擴香器)
                position: [399, 867],  // 固定位置
                scentType: 'lavender',
                color: [255, 0, 255],  // 紫色
                active: false
            },
            2: {  // 按鍵2 - 柑橘 (燈光)
                position: [400, 1972],  // 固定位置
                scentType: 'citrus',
                color: [255, 165, 0],  // 橘色
                active: false
            },
            3: {  // 按鍵3 - 尤加利 (音響)
                position: [997, 1407],  // 固定位置
                scentType: 'eucalyptus',
                color: [0, 255, 0],  // 綠色
                active: false
            }
        };
        
        // 氣味波容器 - 存儲所有活躍的獨立氣味波
        this.scentWaves = [];
        
        // 氣味顏色映射
        this.scentColors = {
            'lavender': [255, 0, 255],    // 紫色
            'citrus': [255, 165, 0],      // 橘色
            'eucalyptus': [0, 255, 0]     // 綠色
        };
        
        // Canvas 相關
        this.canvas = null;
        this.ctx = null;
        this.imageData = null;
        this.data = null;
        this.isRunning = false;
        
        // 設置按鍵監聽
        this.setupKeyboardControls();
        
        console.log('🌬️ 獨立氣味波物理擴散系統已初始化');
        console.log('🎮 控制方式: 按鍵 1(薰衣草) / 2(柑橘) / 3(尤加利)');
    }
    
    /**
     * 設置按鍵控制 - 按鍵1/2/3釋放不同氣味
     */
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            if (['1', '2', '3'].includes(key)) {
                const deviceNum = parseInt(key);
                this.activateScentDevice(deviceNum);
                e.preventDefault();
            }
        });
        
        console.log('⌨️ 按鍵控制已設置: 1, 2, 3');
    }
    
    /**
     * 激活氣味釋放器，創建新的獨立氣味波
     */
    activateScentDevice(deviceNum) {
        if (deviceNum in this.scentDevices) {
            const device = this.scentDevices[deviceNum];
            
            // 創建新的獨立氣味波
            const newWave = new ScentWave(
                [...device.position],  // 複製位置數組
                device.scentType,
                [...device.color],     // 複製顏色數組
                5.0,
                [this.mapHeight, this.mapWidth]
            );
            
            this.scentWaves.push(newWave);
            device.active = true;
            
            console.log(`🌬️ 按鍵${deviceNum}: ${device.scentType} 新獨立氣味波釋放 - 位置: [${device.position[0]}, ${device.position[1]}] (總波數: ${this.scentWaves.length})`);
            
            return true;
        }
        return false;
    }
    
    /**
     * 更新設備位置（從動態位置系統）
     */
    updateDevicePositions(positions) {
        // 將前端設備名稱映射到按鍵編號
        const deviceMapping = {
            'diffuser': 1,  // 擴香器 -> 按鍵1 薰衣草
            'lamp': 2,      // 燈光 -> 按鍵2 柑橘
            'speaker': 3    // 音響 -> 按鍵3 尤加利
        };
        
        for (const [deviceKey, position] of Object.entries(positions)) {
            const deviceNum = deviceMapping[deviceKey];
            if (deviceNum && deviceNum in this.scentDevices) {
                this.scentDevices[deviceNum].position = [...position];
                console.log(`📍 按鍵${deviceNum} (${this.scentDevices[deviceNum].scentType}) 位置更新: [${position[0]}, ${position[1]}]`);
            }
        }
    }
    
    /**
     * 清除所有氣味波和地圖上的氣味
     */
    clearAllScents() {
        // 清除所有獨立氣味波
        this.scentWaves.length = 0;
        
        // 清除顯示地圖上的所有氣味
        for (const scentType in this.scentMaps) {
            this.scentMaps[scentType].fill(0.0);
        }
        
        // 停用所有設備
        for (const device of Object.values(this.scentDevices)) {
            device.active = false;
        }
        
        console.log('🧹 所有獨立氣味波已清除');
    }
    
    /**
     * 更新氣味物理擴散 - 每個氣味波完全獨立
     */
    updateScentPhysics() {
        // 更新所有獨立氣味波（每個氣味波會自己更新自己的地圖）
        const activeWaves = [];
        
        for (const wave of this.scentWaves) {
            wave.update();  // 氣味波會自己更新自己的獨立地圖
            if (wave.isAlive()) {
                activeWaves.push(wave);
            }
        }
        
        // 只保留還活躍的氣味波
        this.scentWaves = activeWaves;
        
        // 重新建構顯示地圖（合併所有獨立氣味波）
        this._rebuildDisplayMaps();
    }
    
    /**
     * 重新建構顯示地圖 - 合併所有獨立氣味波的地圖
     */
    _rebuildDisplayMaps() {
        // 清空顯示地圖
        for (const scentType in this.scentMaps) {
            this.scentMaps[scentType].fill(0.0);
        }
        
        // 將每個獨立氣味波的地圖合併到對應的顯示地圖
        for (const wave of this.scentWaves) {
            const scentType = wave.scentType;
            if (scentType in this.scentMaps) {
                // 相加氣味強度，實現重疊增強效果（限制最大值）
                const displayMap = this.scentMaps[scentType];
                const waveMap = wave.scentMap;
                
                for (let i = 0; i < displayMap.length; i++) {
                    const combined = displayMap[i] + waveMap[i];
                    displayMap[i] = Math.min(combined, 3.5);  // 限制最大濃度
                }
            }
        }
    }
    
    /**
     * 初始化Canvas
     */
    initCanvas(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`❌ Canvas元素 '${canvasId}' 未找到`);
            return false;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // 創建ImageData以提升性能
        this.imageData = this.ctx.createImageData(this.width, this.height);
        this.data = this.imageData.data;
        
        console.log(`🎨 Canvas已初始化: ${this.width}x${this.height}`);
        return true;
    }
    
    /**
     * 渲染氣味視覺化
     */
    render() {
        if (!this.ctx || !this.imageData) return;
        
        // 清除畫布數據
        this.data.fill(0);
        
        // 渲染每種氣味類型
        for (const [scentType, scentMap] of Object.entries(this.scentMaps)) {
            if (scentType in this.scentColors) {
                const color = this.scentColors[scentType];
                this._renderScentLayer(scentMap, color);
            }
        }
        
        // 將ImageData繪製到Canvas
        this.ctx.putImageData(this.imageData, 0, 0);
    }
    
    /**
     * 渲染單個氣味層
     */
    _renderScentLayer(scentMap, color) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // 從降採樣地圖中獲取濃度
                const mapX = Math.floor(x / this.scaleFactor);
                const mapY = Math.floor(y / this.scaleFactor);
                const mapIndex = mapY * this.mapWidth + mapX;
                
                const concentration = scentMap[mapIndex] || 0;
                
                if (concentration > 0) {
                    // 非線性映射增強對比度
                    const normalizedConcentration = Math.min(concentration / 2.5, 1.0);
                    const alpha = Math.sqrt(normalizedConcentration);  // 平方根映射
                    
                    const pixelIndex = (y * this.width + x) * 4;
                    
                    // Alpha混合
                    const existingAlpha = this.data[pixelIndex + 3] / 255;
                    const newAlpha = Math.min(existingAlpha + alpha, 1.0);
                    
                    if (newAlpha > 0) {
                        // 混合顏色
                        const blendFactor = alpha / newAlpha;
                        this.data[pixelIndex] = Math.min(255, this.data[pixelIndex] * (1 - blendFactor) + color[0] * blendFactor);
                        this.data[pixelIndex + 1] = Math.min(255, this.data[pixelIndex + 1] * (1 - blendFactor) + color[1] * blendFactor);
                        this.data[pixelIndex + 2] = Math.min(255, this.data[pixelIndex + 2] * (1 - blendFactor) + color[2] * blendFactor);
                        this.data[pixelIndex + 3] = newAlpha * 255;
                    }
                }
            }
        }
    }
    
    /**
     * 主更新循環
     */
    update() {
        if (!this.isRunning) return;
        
        this.updateScentPhysics();
        this.render();
        
        requestAnimationFrame(() => this.update());
    }
    
    /**
     * 啟動系統
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('▶️ 獨立氣味波系統已啟動 - 30fps更新');
        this.update();
    }
    
    /**
     * 停止系統
     */
    stop() {
        this.isRunning = false;
        console.log('⏹️ 獨立氣味波系統已停止');
    }
    
    /**
     * 獲取系統狀態
     */
    getSystemStatus() {
        return {
            activeWaves: this.scentWaves.length,
            isRunning: this.isRunning,
            devices: Object.fromEntries(
                Object.entries(this.scentDevices).map(([key, device]) => [
                    key,
                    {
                        scentType: device.scentType,
                        position: device.position,
                        active: device.active
                    }
                ])
            ),
            waveDetails: this.scentWaves.map(wave => ({
                scentType: wave.scentType,
                position: wave.position,
                radius: wave.radius,
                intensity: wave.intensity,
                age: wave.age,
                isExpanding: wave.isExpanding
            }))
        };
    }
}

// 全局控制函數
window.clearAllScents = () => {
    if (window.odoraiApp?.scentSystem) {
        window.odoraiApp.scentSystem.clearAllScents();
        console.log('🧹 所有氣味已清除');
    }
};

window.getScentStatus = () => {
    if (window.odoraiApp?.scentSystem) {
        const status = window.odoraiApp.scentSystem.getSystemStatus();
        console.log('📊 氣味系統狀態:', status);
        return status;
    }
    return null;
};

window.startScents = () => {
    if (window.odoraiApp?.scentSystem) {
        window.odoraiApp.scentSystem.start();
        console.log('▶️ 氣味系統已啟動');
    }
};

window.stopScents = () => {
    if (window.odoraiApp?.scentSystem) {
        window.odoraiApp.scentSystem.stop();
        console.log('⏹️ 氣味系統已停止');
    }
};

// 測試函數
window.testKeyboard = () => {
    console.log('⌨️ 測試按鍵控制:');
    console.log('   按 1 = 薰衣草 (紫色)');
    console.log('   按 2 = 柑橘 (橘色)');
    console.log('   按 3 = 尤加利 (綠色)');
    console.log('💡 請點擊頁面任意位置後按鍵測試');
};

console.log('🌬️ 獨立氣味波物理擴散系統已載入');
console.log('🎮 按鍵控制: 1=薰衣草, 2=柑橘, 3=尤加利');
console.log('💡 可用命令: clearAllScents(), getScentStatus(), startScents(), stopScents(), testKeyboard()');

// 導出類別
if (typeof window !== 'undefined') {
    window.PhysicalScentSystem = PhysicalScentSystem;
    window.ScentWave = ScentWave;
} 