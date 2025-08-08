// ÔDÔRAI App.js - Complete Interactive Logic
// ================================================

class OdoraiApp {
    constructor() {
        this.currentModeIndex = 0; // 當前模式索引 (0-4)
        this.currentPage = 'home-page';
        this.currentRoom = 'living'; // 新增: 當前房間狀態
        this.devices = {
            diffuser: true,
            lamp: false,
            speaker: false
        };
        
        // 房間配置
        this.rooms = {
            living: { 
                name: 'LIVING ROOM', 
                icon: '🏠', 
                background: 'LivingRoom-bg.png',
                info: {
                    title: '🏠 Living Room Space',
                    description: 'The central hub of your home, designed for relaxation and social interaction.',
                    features: [
                        { name: 'Smart Lighting', status: 'Active', description: 'Adaptive lighting that adjusts to your mood and time of day' },
                        { name: 'Aromatherapy System', status: 'Connected', description: 'Precision scent diffusion for optimal relaxation' },
                        { name: 'Sound Environment', status: 'Optimized', description: 'Ambient soundscapes enhance your living experience' }
                    ],
                    currentSettings: {
                        temperature: '22°C',
                        humidity: '45%',
                        airQuality: 'Excellent',
                        lighting: 'Warm White (2700K)'
                    },
                    aiInsights: 'This space is optimized for evening relaxation. AI suggests increasing aromatherapy intensity by 15% for better stress relief based on your usage patterns.'
                }
            },
            bedroom: { 
                name: 'BEDROOM', 
                icon: '🛏️', 
                background: 'Bedroom-bg.png',
                info: {
                    title: '🛏️ Bedroom Sanctuary',
                    description: 'Your personal sleep sanctuary, optimized for rest and recovery.',
                    features: [
                        { name: 'Sleep Optimization', status: 'Active', description: 'Advanced sleep tracking and environmental controls' },
                        { name: 'Circadian Lighting', status: 'Synced', description: 'Light therapy that supports your natural sleep cycle' },
                        { name: 'White Noise System', status: 'Calibrated', description: 'Personalized soundscapes for deeper sleep' }
                    ],
                    currentSettings: {
                        temperature: '19°C',
                        humidity: '50%',
                        airQuality: 'Pure',
                        lighting: 'Sleep Mode (1800K)'
                    },
                    aiInsights: 'Based on your sleep data, AI recommends lavender aromatherapy 30 minutes before your usual bedtime. Your sleep quality has improved 23% this week.'
                }
            },
            studio: { 
                name: 'STUDIO', 
                icon: '🎨', 
                background: 'Studio-bg.png',
                info: {
                    title: '🎨 Creative Studio',
                    description: 'Your dedicated creative workspace, designed to inspire and enhance productivity.',
                    features: [
                        { name: 'Focus Enhancement', status: 'Optimized', description: 'Environmental controls to maximize concentration and creativity' },
                        { name: 'Energy Boost System', status: 'Active', description: 'Invigorating scents and lighting for sustained creativity' },
                        { name: 'Inspiration Mode', status: 'Enabled', description: 'Dynamic environment that adapts to your creative flow' }
                    ],
                    currentSettings: {
                        temperature: '21°C',
                        humidity: '40%',
                        airQuality: 'Fresh',
                        lighting: 'Daylight (5000K)'
                    },
                    aiInsights: 'Your most productive hours are 10 AM - 2 PM. AI suggests citrus aromatherapy during morning sessions for 35% better focus and peppermint for afternoon energy.'
                }
            }
        };
        
        // Device position configuration for each mode - 恢復原始正確位置
        this.devicePositions = {
            relax: {
                diffuser: { bottom: '180px', left: '60px' },
                lamp: { bottom: '140px', right: '90px' },
                speaker: { bottom: '260px', right: '60px' }
            },
            focus: {
                diffuser: { bottom: '200px', left: '80px' },
                lamp: { bottom: '160px', right: '70px' },
                speaker: { bottom: '280px', right: '40px' }
            },
            energize: {
                diffuser: { bottom: '190px', left: '70px' },
                lamp: { bottom: '130px', right: '100px' },
                speaker: { bottom: '270px', right: '50px' }
            }
        };
        
        this.positionEditMode = false;
        
        this.autoSwitchTimer = null; // 自動切換計時器
        this.autoSwitchChecker = null; // Safari兼容檢查器
        this.AUTO_SWITCH_TIMEOUT = 1 * 60 * 1000; // 1分鐘自動切換
        this.lastActiveTime = Date.now(); // 記錄最後活動時間
        
        // 初始化氣味系統
        this.scentSystem = null;
        
        // 5種模式配置
        this.modes = [
            {
                id: 'relax',
                name: 'RELAX',
                titleImage: 'RELAX.png',
                circleImage: 'RELAX_COLOR.png',
                blend: 'Oud Wood + Orange + Frankincense',
                background: 'linear-gradient(135deg, #FF6B95 0%, #FFA726 100%)',
                color: '#FF6B95'
            },
            {
                id: 'focus',
                name: 'FOCUS',
                titleImage: 'FOCUS.png',
                circleImage: 'FOCUS_COLOR.png',
                blend: 'Jasmine + Eucalyptus + Peppermint',
                background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
                color: '#4FACFE'
            },
            {
                id: 'sleep',
                name: 'SLEEP',
                titleImage: 'SLEEP.png',
                circleImage: 'SLEEP_COLOR.png',
                blend: 'Lavender + Chamomile + Juniper',
                background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
                color: '#9C27B0'
            },
            {
                id: 'fresh',
                name: 'FRESH',
                titleImage: 'FRESH.png',
                circleImage: 'FRESH_COLOR.png',
                blend: 'Lemon + Green Tea + Cypress',
                background: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
                color: '#43E97B'
            },
            {
                id: 'happy',
                name: 'HAPPY',
                titleImage: 'HAPPY.png',
                circleImage: 'HAPPY_COLOR.png',
                blend: 'Orange Blossom + Freesia + Peach',
                background: 'linear-gradient(135deg, #FFD54F 0%, #FF8A65 100%)',
                color: '#FFD54F'
            }
        ];
        
        // Helper method: Get current mode
        this.getCurrentMode = () => this.modes[this.currentModeIndex];
        
        // Mode detailed information data (English)
        this.modeInfoData = {
            relax: {
                title: '🌙 RELAX Mode',
                coreScents: [
                    { name: 'Oud Wood', effect: 'Deep relaxation and mental tranquility' },
                    { name: 'Orange', effect: 'Mood enhancement and stress relief' },
                    { name: 'Frankincense', effect: 'Meditation and spiritual focus' }
                ],
                aiSummary: 'AI adjusts scent intensity based on your stress levels and time of day, enhancing Oud Wood ratio during evening hours to promote deep relaxation.',
                benefits: [
                    { label: 'Stress Relief', value: '85%' },
                    { label: 'Sleep Quality', value: '78%' },
                    { label: 'Inner Peace', value: '92%' }
                ]
            },
            focus: {
                title: '🎯 FOCUS Mode',
                coreScents: [
                    { name: 'Jasmine', effect: 'Enhanced attention and clear thinking' },
                    { name: 'Eucalyptus', effect: 'Mental alertness and concentration boost' },
                    { name: 'Peppermint', effect: 'Cognitive function and alertness stimulation' }
                ],
                aiSummary: 'AI intelligently detects your work patterns, intensifying Eucalyptus and Peppermint concentrations when high focus is needed.',
                benefits: [
                    { label: 'Concentration', value: '89%' },
                    { label: 'Productivity', value: '76%' },
                    { label: 'Creativity', value: '82%' }
                ]
            },
            sleep: {
                title: '😴 SLEEP Mode',
                coreScents: [
                    { name: 'Lavender', effect: 'Promotes deep sleep and relaxation' },
                    { name: 'Chamomile', effect: 'Soothes nerves and reduces anxiety' },
                    { name: 'Juniper', effect: 'Air purification and mental calm' }
                ],
                aiSummary: 'AI adjusts scent intensity based on your sleep cycle, starting diffusion 30 minutes before bedtime to ensure optimal sleep quality.',
                benefits: [
                    { label: 'Sleep Onset', value: '68%' },
                    { label: 'Deep Sleep', value: '85%' },
                    { label: 'Sleep Quality', value: '91%' }
                ]
            },
            fresh: {
                title: '🌿 FRESH Mode',
                coreScents: [
                    { name: 'Lemon', effect: 'Mental invigoration and air freshening' },
                    { name: 'Green Tea', effect: 'Peaceful mindset and antioxidant benefits' },
                    { name: 'Cypress', effect: 'Environmental purification and fatigue relief' }
                ],
                aiSummary: 'AI monitors air quality and automatically adjusts Lemon and Cypress ratios to maintain optimal freshness in your space.',
                benefits: [
                    { label: 'Air Freshness', value: '94%' },
                    { label: 'Mental State', value: '87%' },
                    { label: 'Environment Purification', value: '89%' }
                ]
            },
            happy: {
                title: '😊 HAPPY Mode',
                coreScents: [
                    { name: 'Orange Blossom', effect: 'Happiness boost and joyful mood' },
                    { name: 'Freesia', effect: 'Positive emotions and energy enhancement' },
                    { name: 'Peach', effect: 'Warm feelings and social comfort' }
                ],
                aiSummary: 'AI analyzes your emotional state and enhances Orange Blossom\'s sweet notes when needed to boost overall well-being.',
                benefits: [
                    { label: 'Happiness', value: '93%' },
                    { label: 'Social Energy', value: '86%' },
                    { label: 'Positive Emotions', value: '91%' }
                ]
            }
        };
        
        this.stats = {
            alarm: 'AM 07:03',
            sleep: {
                time: '8hr 48m',
                change: '+2.2%',
                positive: true
            },
            focus: {
                time: '1hr 03m',
                change: '+5.8%',
                positive: true
            }
        };


        
        this.init();
        this.loadPositionsFromStorage();
        this.setupWebSocket();
    }
    
    init() {
        console.log('Initializing ÔDÔRAI app...');
        
        // 確保 DOM 完全加載後再設置事件監聽器
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
            });
        } else {
            this.setupEventListeners();
        }
        
        this.updateUI();
        this.initScentSystem();
        
        // 初始化模式顯示 - 延遲執行確保 DOM 完全加載
        setTimeout(() => {
            console.log('🚀 開始初始化模式顯示...');
            this.updateModeDisplay();
            this.updateModeDotsDisplay();
        }, 100);
        
        // 初始化時間顯示
        this.updateTriggerTime();
        
        // 每1分鐘更新一次時間 (60000 ms) - 改為實時更新
        setInterval(() => this.updateTriggerTime(), 60000);
        
        // Simulate data updates every 30 seconds
        setInterval(() => this.updateStats(), 30000);
        
        console.log('ÔDÔRAI app fully initialized');
        
        // 延遲1秒後進行info-icon調試檢查
        setTimeout(() => {
            this.checkInfoIcons();
            this.startAutoSwitchTimer(); // 啟動自動切換計時器
            this.setupVisibilityHandler(); // 設置頁面可見性檢測
        }, 1000);
    }
    
    // 檢查 info-icon 功能
    checkInfoIcons() {
        const allInfoIcons = document.querySelectorAll('.info-icon');
        console.log(`✅ Info-icon 功能檢查 - 找到 ${allInfoIcons.length} 個圖標`);
        
        allInfoIcons.forEach((icon, index) => {
            const pageId = icon.closest('.page')?.id;
            const styles = window.getComputedStyle(icon);
            console.log(`🔍 Info-icon ${index + 1}:`, {
                pageId,
                display: styles.display,
                visibility: styles.visibility,
                pointerEvents: styles.pointerEvents,
                zIndex: styles.zIndex,
                position: styles.position
            });
        });
        
        console.log('💡 Info-icon 功能已激活，點擊查看詳細信息');
    }
    
    // ⏰ 自動切換模式系統
    startAutoSwitchTimer() {
        // 清除現有計時器
        if (this.autoSwitchTimer) {
            clearTimeout(this.autoSwitchTimer);
        }
        
        // 清除現有的檢查間隔
        if (this.autoSwitchChecker) {
            clearInterval(this.autoSwitchChecker);
        }
        
        // 更新最後活動時間
        this.lastActiveTime = Date.now();
        
        console.log('⏰ 啟動自動切換計時器 - 1分鐘後自動切換模式（測試模式）');
        console.log('📱 同時啟動Safari兼容檢查器');
        
        // 主要計時器
        this.autoSwitchTimer = setTimeout(() => {
            this.autoSwitchMode();
        }, this.AUTO_SWITCH_TIMEOUT);
        
        // Safari兼容檢查器 - 每10秒檢查一次是否該切換了
        this.autoSwitchChecker = setInterval(() => {
            const now = Date.now();
            const timePassed = now - this.lastActiveTime;
            
            if (timePassed >= this.AUTO_SWITCH_TIMEOUT) {
                console.log('🍎 Safari檢查器觸發自動切換');
                this.autoSwitchMode();
            }
        }, 10000); // 每10秒檢查一次
    }
    
    // 🎲 執行自動模式切換
    autoSwitchMode() {
        // 從5個模式中隨機選擇一個
        const randomIndex = Math.floor(Math.random() * this.modes.length);
        const oldModeIndex = this.currentModeIndex;
        const oldMode = this.getCurrentMode();
        
        console.log(`🎲 自動切換開始: 當前 ${oldMode.name} (索引${oldModeIndex}) -> 隨機選擇 ${this.modes[randomIndex].name} (索引${randomIndex})`);
        
        // 更新模式索引
        this.currentModeIndex = randomIndex;
        
        // 獲取新模式信息
        const newMode = this.getCurrentMode();
        
        console.log(`🔄 模式索引已更新: ${oldModeIndex} -> ${this.currentModeIndex}`);
        console.log(`📝 模式名稱: ${oldMode.name} -> ${newMode.name}`);
        
        // 更新顯示
        console.log('🖼️ 開始更新模式顯示...');
        this.updateModeDisplay();
        this.updateModeDotsDisplay();
        console.log('✅ 模式顯示更新完成');
        
        // 判斷是否實際改變了模式
        if (randomIndex === oldModeIndex) {
            console.log(`🎯 隨機選中相同模式 ${newMode.name}，視覺上不會變化`);
        } else {
            console.log(`✅ 成功切換模式: ${oldMode.name} -> ${newMode.name}`);
            // 顯示自動切換通知
            this.showAutoSwitchNotification(oldMode.name, newMode.name);
        }
        
        // 清除檢查器（避免重複觸發）
        if (this.autoSwitchChecker) {
            clearInterval(this.autoSwitchChecker);
            this.autoSwitchChecker = null;
        }
        
        // 重新啟動計時器
        console.log('⏰ 重新啟動自動切換計時器...');
        this.startAutoSwitchTimer();
    }
    
    // 📝 顯示自動切換通知
    showAutoSwitchNotification(fromMode, toMode) {
        if (fromMode === toMode) {
            // 相同模式不顯示通知，保持安靜
            return;
        }
        
        const notification = document.createElement('div');
        notification.className = 'auto-switch-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            backdrop-filter: blur(10px);
            z-index: 2000;
            font-size: 14px;
            font-family: 'NCTTorin Regular', sans-serif;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            opacity: 0;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        notification.textContent = `🤖 AI Auto-Switch: ${fromMode} → ${toMode}`;
        
        document.body.appendChild(notification);
        
        // 顯示動畫
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);
        
        // 3秒後消失
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (notification.parentElement) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // 🔄 重置自動切換計時器（用於手動切換時）
    resetAutoSwitchTimer() {
        console.log('🔄 檢測到手動切換，重置自動切換計時器');
        
        // 清除現有計時器和檢查器
        if (this.autoSwitchTimer) {
            clearTimeout(this.autoSwitchTimer);
            this.autoSwitchTimer = null;
        }
        if (this.autoSwitchChecker) {
            clearInterval(this.autoSwitchChecker);
            this.autoSwitchChecker = null;
        }
        
        this.startAutoSwitchTimer();
    }
    
    // 📱 設置頁面可見性檢測（解決 iPad Safari 背景暫停問題）
    setupVisibilityHandler() {
        // 檢查瀏覽器支援的 Page Visibility API
        let hidden, visibilityChange;
        if (typeof document.hidden !== "undefined") {
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }
        
        if (!visibilityChange) {
            console.warn('⚠️ 此瀏覽器不支援 Page Visibility API');
            return;
        }
        
        const handleVisibilityChange = () => {
            if (document[hidden]) {
                // 頁面隱藏（背景、螢幕關閉等）
                console.log('📱 頁面進入背景，記錄當前時間');
                // 不清除計時器，而是記錄時間
            } else {
                // 頁面重新可見
                console.log('📱 頁面重新可見，檢查是否需要執行自動切換');
                
                const now = Date.now();
                const timePassed = now - this.lastActiveTime;
                
                if (timePassed >= this.AUTO_SWITCH_TIMEOUT) {
                    // 已經超過1分鐘，立即執行自動切換
                    console.log(`📱 離開時間 ${Math.round(timePassed / 1000)}秒，立即執行自動切換`);
                    this.autoSwitchMode();
                } else {
                    // 重新啟動計時器，剩餘時間
                    const remainingTime = this.AUTO_SWITCH_TIMEOUT - timePassed;
                    console.log(`📱 重新啟動計時器，剩餘 ${Math.round(remainingTime / 1000)}秒`);
                    
                    if (this.autoSwitchTimer) {
                        clearTimeout(this.autoSwitchTimer);
                    }
                    
                    this.autoSwitchTimer = setTimeout(() => {
                        this.autoSwitchMode();
                    }, remainingTime);
                }
            }
        };
        
        document.addEventListener(visibilityChange, handleVisibilityChange, false);
        console.log('📱 頁面可見性檢測已啟用，支援 iPad Safari 背景恢復');
    }
    

    
    setupEventListeners() {
        // Bottom navigation - Made more robust
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.dataset.page;
                if (pageId) {
                    this.switchPage(pageId);
                }
            });
        });
        
        // Device controls
        document.querySelectorAll('.device-icon').forEach(device => {
            device.addEventListener('click', () => {
                const deviceType = device.dataset.device;
                this.toggleDevice(deviceType);
            });
        });
        
        // Mode switching (click on mode title)
        /* document.getElementById('home-mode-title').addEventListener('click', () => {
            this.cycleModes();
        }); */
        

        
        // Mode-page swipe for mode switching only
        this.setupModePageSwipe();
        
        // Mode-page dots click
        this.setupModeDotsClick();
        
        // Spatial-page swipe for room switching
        this.setupSpatialPageSwipe();
        
        // Add device button
        /* document.querySelector('.add-device-btn').addEventListener('click', () => {
            this.showAddDeviceDialog();
        }); */
        
        // Touch gestures for mobile - 移除頁面間滑動，只保留頁面內滑動
        // this.setupTouchGestures();
        
        // Add resize listener to keep scent points in sync
        window.addEventListener('resize', () => this.syncScentDevicePositions());
        
        // Info icons - Using event delegation for efficiency
        document.body.addEventListener('click', (event) => {
            const infoIcon = event.target.closest('.info-icon');
            if (infoIcon) {
                const parentPage = infoIcon.closest('.page');
                if (parentPage) {
                    switch (parentPage.id) {
                        case 'home-page':
                            this.showHomeInfo();
                            break;
                        case 'mode-page':
                            this.showModeInfo();
                            break;
                        case 'spatial-page':
                            this.showSpatialInfo();
                            break;
                    }
                }
            }
        });

        // Spatial page interactions (original code was broader, now more specific)
        document.getElementById('spatial-page').addEventListener('click', (e) => {
            const addPoint = e.target.closest('.add-point');
            if (addPoint) {
                this.showAddDeviceAtPoint(addPoint);
            }
            
            const roomDevice = e.target.closest('.room-device');
            if (roomDevice) {
                const deviceType = roomDevice.dataset.device;
                if (deviceType) {
                    this.toggleDevice(deviceType);
                    this.showSpatialDeviceAnimation(roomDevice);
                }
            }
        });
    }
    
    setupTouchGestures() {
        let startX = 0;
        let startY = 0;
        const appContainer = document.querySelector('.app-container');

        if (!appContainer) return;

        appContainer.addEventListener('touchstart', (e) => {
            // Don't start a swipe if the target is an interactive element or content block
            if (e.target.closest('button, .nav-item, .device-icon, .mode-circle, .info-icon, .stats-container, .mode-info')) {
                startX = null;
                startY = null;
                return;
            }
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true }); // Use passive for better scroll performance

        appContainer.addEventListener('touchend', (e) => {
            if (startX === null) return; // Swipe was not initiated

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Horizontal swipe detection
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextPage();
                } else {
                    this.prevPage();
                }
            }
            
            // Reset for the next touch
            startX = null;
            startY = null;
        });
    }
    
    setupModePageSwipe() {
        const modeImageContainer = document.querySelector('.mode-image-container');
        if (!modeImageContainer) return;
        let startX = null;
        let startY = null;
        
        modeImageContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        modeImageContainer.addEventListener('touchend', (e) => {
            if (startX === null) return;
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            // 只偵測水平滑動且距離夠大
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                console.log(`👆 偵測到滑動: diffX=${diffX}, diffY=${diffY}`);
                if (diffX > 0) {
                    console.log('➡️ 向右滑動 - 切換到下一個模式');
                    this.animateModeSwitch('next');
                } else {
                    console.log('⬅️ 向左滑動 - 切換到上一個模式');
                    this.animateModeSwitch('prev');
                }
            } else {
                console.log(`❌ 滑動距離不足或非水平滑動: diffX=${diffX}, diffY=${diffY}`);
            }
            startX = null;
            startY = null;
        });
    }

    setupSpatialPageSwipe() {
        const spatialPage = document.getElementById('spatial-page');
        if (!spatialPage) return;
        let startX = null;
        let startY = null;
        
        spatialPage.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        spatialPage.addEventListener('touchend', (e) => {
            if (startX === null) return;
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // 只偵測水平滑動且距離夠大
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.animateRoomSwitch('next');
                } else {
                    this.animateRoomSwitch('prev');
                }
            }
            startX = null;
            startY = null;
        });
    }

    animateModeSwitch(direction) {
        // 計算新模式索引
        let newIndex;
        if (direction === 'next') {
            newIndex = (this.currentModeIndex + 1) % this.modes.length;
        } else {
            newIndex = (this.currentModeIndex - 1 + this.modes.length) % this.modes.length;
        }
        
        // 更新當前模式索引
        this.currentModeIndex = newIndex;
        
        // 更新模式顯示
        this.updateModeDisplay();
        
        // 更新導航點
        this.updateModeDotsDisplay();
        
        // 🔄 重置自動切換計時器（手動切換）
        this.resetAutoSwitchTimer();
        
        console.log(`切換到模式: ${this.getCurrentMode().name} (${newIndex + 1}/${this.modes.length})`);
    }
    
    // 快速修復方案 - 替換 updateModeDisplay 函數
    updateModeDisplay() {
        const currentMode = this.getCurrentMode();
        console.log(`🔄 更新模式顯示: ${currentMode.name}`);
        
        // 方法1: 直接設置 HTML 確保圖片載入
        const modeImageContainer = document.querySelector('.mode-image-container');
        if (modeImageContainer) {
            // 重新創建圖片元素
            modeImageContainer.innerHTML = `
                <div class="pink-circle">
                    <img src="./assets/images/${currentMode.circleImage}" 
                         alt="${currentMode.name} Color" 
                         class="circle-image"
                         onload="console.log('圖片載入成功: ${currentMode.circleImage}')"
                         onerror="console.error('圖片載入失敗: ${currentMode.circleImage}'); this.src='./assets/images/default.png';">
                </div>
                <div class="mode-title">
                    <img src="./assets/images/${currentMode.titleImage}" 
                         alt="${currentMode.name}" 
                         class="relax-title-img"
                         onload="console.log('標題圖片載入成功: ${currentMode.titleImage}')"
                         onerror="console.error('標題圖片載入失敗: ${currentMode.titleImage}');">
                </div>
            `;
        }
        
        // 更新香味描述
        const scentDesc = document.querySelector('.scent-description');
        if (scentDesc) {
            scentDesc.textContent = currentMode.blend;
        }
        
        // 🔄 同步更新 HOME PAGE 的主標題圖片
        this.syncHomePageTitle();
    }
    

    // 🏠 同步 HOME PAGE 標題圖片函數
    syncHomePageTitle() {
        const currentMode = this.getCurrentMode();
        const homePageTitleImg = document.querySelector('#home-page .main-title-img');
        
        if (homePageTitleImg) {
            const oldSrc = homePageTitleImg.src;
            const newSrc = `./assets/images/${currentMode.titleImage}`;
            
            if (oldSrc !== newSrc) {
                homePageTitleImg.src = newSrc;
                homePageTitleImg.alt = currentMode.name;
                
                console.log(`🏠 HOME PAGE 標題圖片已同步: ${currentMode.name} -> ${currentMode.titleImage}`);
                
                // 添加載入狀態監控
                homePageTitleImg.onload = () => {
                    console.log(`✅ HOME PAGE 圖片載入成功: ${currentMode.titleImage}`);
                };
                homePageTitleImg.onerror = () => {
                    console.error(`❌ HOME PAGE 圖片載入失敗: ${currentMode.titleImage}`);
                };
            }
        } else {
            console.warn('⚠️ 找不到 HOME PAGE 的主標題圖片元素');
        }
    }

    // 方法2: 使用 CSS background-image 作為後備方案
    updateModeDisplayWithBackground() {
        const currentMode = this.getCurrentMode();
        
        // 設置圓形背景
        const pinkCircle = document.querySelector('.pink-circle');
        if (pinkCircle) {
            // 移除 img 元素，使用 div 的背景圖片
            pinkCircle.innerHTML = '';
            pinkCircle.style.width = '445px';
            pinkCircle.style.height = '445px';
            pinkCircle.style.borderRadius = '50%';
            pinkCircle.style.backgroundImage = `url('./assets/images/${currentMode.circleImage}')`;
            pinkCircle.style.backgroundSize = 'cover';
            pinkCircle.style.backgroundPosition = 'center';
            pinkCircle.style.backgroundRepeat = 'no-repeat';
            
            console.log(`使用背景圖片: ./assets/images/${currentMode.circleImage}`);
        }
        
        // 更新模式標題圖片
        const titleImg = document.querySelector('.relax-title-img');
        if (titleImg) {
            titleImg.src = `./assets/images/${currentMode.titleImage}`;
            titleImg.alt = currentMode.name;
        }
        
        // 更新香味描述
        const scentDesc = document.querySelector('.scent-description');
        if (scentDesc) {
            scentDesc.textContent = currentMode.blend;
        }
    }
    
    // 更新模式導航點顯示
    updateModeDotsDisplay() {
        const modeDots = document.querySelector('.mode-dots');
        if (modeDots) {
            const dots = modeDots.querySelectorAll('.nav-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentModeIndex);
            });
        }
    }
    
    // 設置模式導航點點擊事件
    setupModeDotsClick() {
        const modeDots = document.querySelector('.mode-dots');
        if (modeDots) {
            modeDots.addEventListener('click', (e) => {
                const clickedDot = e.target.closest('.nav-dot');
                if (clickedDot) {
                    const dots = Array.from(modeDots.querySelectorAll('.nav-dot'));
                    const clickedIndex = dots.indexOf(clickedDot);
                    
                    if (clickedIndex !== -1 && clickedIndex !== this.currentModeIndex) {
                        this.currentModeIndex = clickedIndex;
                        this.updateModeDisplay(); // 這裡已經包含了 syncHomePageTitle()
                        this.updateModeDotsDisplay();
                        
                        // 🔄 重置自動切換計時器（手動點擊切換）
                        this.resetAutoSwitchTimer();
                        
                        console.log(`點擊切換到模式: ${this.getCurrentMode().name} (${clickedIndex + 1}/${this.modes.length})`);
                    }
                }
            });
        }
    }

    animateRoomSwitch(direction) {
        const roomKeys = Object.keys(this.rooms);
        const currentIndex = roomKeys.indexOf(this.currentRoom);
        let newIndex;
        
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % roomKeys.length;
        } else {
            newIndex = (currentIndex - 1 + roomKeys.length) % roomKeys.length;
        }
        
        const newRoom = roomKeys[newIndex];
        
        // 房間導航點動畫
        const roomDots = document.querySelector('.room-dots');
        if (roomDots) {
            const dots = Array.from(roomDots.children);
            dots.forEach(dot => dot.classList.remove('middle'));
            dots[newIndex].classList.add('middle');
            
            // 導航點滑動動畫
            roomDots.classList.remove('slide-left', 'slide-right');
            roomDots.classList.add(direction === 'next' ? 'slide-left' : 'slide-right');
        }
        
        // 背景切換動畫
        const roomBackground = document.querySelector('.room-background');
        if (roomBackground) {
            roomBackground.style.opacity = '0.7';
            setTimeout(() => {
                this.currentRoom = newRoom;
                this.updateRoomUI();
                roomBackground.style.opacity = '1';
                if (roomDots) {
                    roomDots.classList.remove('slide-left', 'slide-right');
                }
            }, 200);
        } else {
            this.currentRoom = newRoom;
            this.updateRoomUI();
            if (roomDots) {
                roomDots.classList.remove('slide-left', 'slide-right');
            }
        }
    }

    updateRoomUI() {
        const room = this.rooms[this.currentRoom];
        
        // 更新房間標籤文字
        const roomNameElement = document.querySelector('#spatial-page .room-name');
        if (roomNameElement) {
            roomNameElement.textContent = room.name;
        }
        
        // 更新背景圖片
        const roomImage = document.querySelector('.room-image');
        if (roomImage) {
            roomImage.src = `./assets/images/${room.background}`;
        }
        
        // 更新房間導航點
        const roomDots = document.querySelector('#spatial-page .room-dots');
        if (roomDots) {
            const roomKeys = Object.keys(this.rooms);
            const currentIndex = roomKeys.indexOf(this.currentRoom);
            const dots = Array.from(roomDots.children);
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
        
        console.log(`🏠 切換到房間: ${room.name}`);
    }
    
    switchPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        document.getElementById(pageId).classList.add('active');
        
        // Update navigation - Made more robust
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        this.currentPage = pageId;
        
        // Trigger page-specific animations
        this.animatePageTransition(pageId);
    }
    
    nextPage() {
        const pages = ['home-page', 'mode-page', 'spatial-page'];
        const currentIndex = pages.indexOf(this.currentPage);
        const nextIndex = (currentIndex + 1) % pages.length;
        this.switchPage(pages[nextIndex]);
    }
    
    prevPage() {
        const pages = ['home-page', 'mode-page', 'spatial-page'];
        const currentIndex = pages.indexOf(this.currentPage);
        const prevIndex = (currentIndex - 1 + pages.length) % pages.length;
        this.switchPage(pages[prevIndex]);
    }
    
    toggleDevice(deviceType) {
        this.devices[deviceType] = !this.devices[deviceType];
        this.updateDeviceUI();
        this.simulateDeviceResponse(deviceType);
        
        // 新系統使用按鍵控制，不再需要點擊控制
        console.log(`💡 ${deviceType} 狀態切換，請使用按鍵控制氣味釋放:`);
        console.log('   按 1 = 薰衣草 (擴香器)');
        console.log('   按 2 = 柑橘 (燈光)');
        console.log('   按 3 = 尤加利 (音響)');
    }
    
    updateDeviceUI() {
        Object.keys(this.devices).forEach(deviceType => {
            const deviceElement = document.querySelector(`[data-device="${deviceType}"]`);
            if (deviceElement) {
                if (this.devices[deviceType]) {
                    deviceElement.classList.add('active');
                } else {
                    deviceElement.classList.remove('active');
                }
            }
        });
    }
    
    updateDevicePositions() {
        // 位置已在CSS中固定，不需要動態更新
        console.log('設備位置已在CSS中固定');
        return;
    }
    
    // Toggle position editing mode (for development)
    togglePositionEditMode() {
        this.positionEditMode = !this.positionEditMode;
        
        document.querySelectorAll('.device-icon').forEach(device => {
            if (this.positionEditMode) {
                // Enable edit mode
                device.style.border = '2px solid #00ff00';
                device.style.cursor = 'move';
                device.style.boxShadow = '0 0 10px #00ff00';
                this.makeDeviceDraggable(device);
                console.log(`✅ ${device.dataset.device} 拖拽已啟用`);
            } else {
                // Disable edit mode
                device.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                device.style.cursor = 'pointer';
                device.style.boxShadow = '';
                
                // Clean up event handlers
                if (device._dragHandlers) {
                    device.removeEventListener('mousedown', device._dragHandlers.mousedown);
                    delete device._dragHandlers;
                }
            }
        });
        
        console.log(`位置編輯模式: ${this.positionEditMode ? '開啟' : '關閉'}`);
        if (this.positionEditMode) {
            console.log('🎯 現在可以拖拽所有 3 個設備圖標！');
            console.log('�� 擴香器 (diffuser) | 燈光 (lamp) | 音響 (speaker)');
        }
        return this.positionEditMode;
    }
    
    makeDeviceDraggable(device) {
        let isDragging = false;
        let startX, startY, startLeft, startBottom;
        
        // Create unique event handlers for this device
        const handleMouseDown = (e) => {
            if (!this.positionEditMode) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = device.getBoundingClientRect();
            const container = device.parentElement.getBoundingClientRect();
            
            startLeft = rect.left - container.left;
            startBottom = container.bottom - rect.bottom;
            
            e.preventDefault();
            
            // Add move and up handlers when dragging starts
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };
        
        const handleMouseMove = (e) => {
            if (!isDragging || !this.positionEditMode) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newLeft = startLeft + deltaX;
            const newBottom = startBottom - deltaY;
            
            device.style.left = `${Math.max(0, newLeft)}px`;
            device.style.bottom = `${Math.max(0, newBottom)}px`;
            device.style.right = '';
            device.style.top = '';
        };
        
        const handleMouseUp = () => {
            if (isDragging && this.positionEditMode) {
                // Update position configuration
                const deviceType = device.dataset.device;
                const left = device.style.left;
                const bottom = device.style.bottom;
                
                // Auto-save to internal configuration
                const currentModeId = this.getCurrentMode().id;
                if (!this.devicePositions[currentModeId]) {
                    this.devicePositions[currentModeId] = {};
                }
                
                // Convert right positioning to left if needed
                const rect = device.getBoundingClientRect();
                const container = device.parentElement.getBoundingClientRect();
                
                if (left) {
                    this.devicePositions[currentModeId][deviceType] = {
                        bottom: bottom,
                        left: left
                    };
                } else {
                    const rightValue = container.width - rect.right + container.left;
                    this.devicePositions[currentModeId][deviceType] = {
                        bottom: bottom,
                        right: `${rightValue}px`
                    };
                }
                
                console.log(`✅ ${deviceType} 位置已保存: left: ${left}, bottom: ${bottom}`);
                console.log(`CSS 設定: .${currentModeId}-mode .device-icon.${deviceType} { bottom: ${bottom}; left: ${left}; }`);
                
                // Store in localStorage for persistence
                this.savePositionsToStorage();
                
                // 同步位置到氣味系統
                setTimeout(() => {
                    if (window.dynamicPositionSystem) {
                        window.dynamicPositionSystem.syncNow();
                        console.log('🎯 拖拽完成 - 位置已同步到氣味系統');
                    }
                }, 100);
            }
            isDragging = false;
            
            // Remove event listeners when dragging ends
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        // Bind the mousedown event to the device
        device.addEventListener('mousedown', handleMouseDown);
        
        // Store handlers for cleanup
        device._dragHandlers = {
            mousedown: handleMouseDown,
            mousemove: handleMouseMove,
            mouseup: handleMouseUp
        };
    }
    
    // Save positions to localStorage
    savePositionsToStorage() {
        try {
            localStorage.setItem('odorai_device_positions', JSON.stringify(this.devicePositions));
            console.log('💾 設備位置已保存到瀏覽器儲存');
        } catch (error) {
            console.error('❌ 保存失敗:', error);
        }
    }
    
    // Load positions from localStorage
    loadPositionsFromStorage() {
        try {
            const saved = localStorage.getItem('odorai_device_positions');
            if (saved) {
                this.devicePositions = { ...this.devicePositions, ...JSON.parse(saved) };
                console.log('📂 已載入保存的設備位置');
                return true;
            }
        } catch (error) {
            console.error('❌ 載入失敗:', error);
        }
        return false;
    }
    
    // Export current positions as CSS
    exportPositionsAsCSS() {
        let css = '\n/* ÔDÔRAI 設備位置 CSS */\n';
        
        Object.keys(this.devicePositions).forEach(mode => {
            css += `\n/* ${mode.toUpperCase()} 模式設備位置 */\n`;
            Object.keys(this.devicePositions[mode]).forEach(device => {
                const pos = this.devicePositions[mode][device];
                css += `.${mode}-mode .device-icon.${device} {\n`;
                Object.keys(pos).forEach(prop => {
                    css += `    ${prop}: ${pos[prop]};\n`;
                });
                css += `}\n\n`;
            });
        });
        
        console.log(css);
        return css;
    }
    
    // Clear all saved positions
    clearSavedPositions() {
        localStorage.removeItem('odorai_device_positions');
        console.log('🗑️ 已清除所有保存的位置');
        
        // Reset to default positions
        this.devicePositions = {
            relax: {
                diffuser: { bottom: '180px', left: '60px' },
                lamp: { bottom: '140px', right: '90px' },
                speaker: { bottom: '260px', right: '60px' }
            },
            focus: {
                diffuser: { bottom: '200px', left: '80px' },
                lamp: { bottom: '160px', right: '70px' },
                speaker: { bottom: '280px', right: '40px' }
            },
            energize: {
                diffuser: { bottom: '190px', left: '70px' },
                lamp: { bottom: '130px', right: '100px' },
                speaker: { bottom: '270px', right: '50px' }
            }
        };
        
        this.updateDevicePositions();
    }
    
    delayedInitScentSystem() {
        // 檢查是否需要等待位置恢復
        if (window.delayedScentInit) {
            console.log('⏰ 等待位置恢復完成後再初始化氣味系統...');
            
            // 監聽位置準備事件
            const positionsReadyHandler = () => {
                console.log('✅ 位置已準備就緒，開始初始化氣味系統');
                this.initScentSystem();
                window.removeEventListener('positionsReady', positionsReadyHandler);
            };
            
            window.addEventListener('positionsReady', positionsReadyHandler);
            
            // 超時保護：如果5秒內沒有位置事件，強制初始化
            setTimeout(() => {
                if (!this.scentSystem) {
                    console.log('⚠️ 位置恢復超時，強制初始化氣味系統');
                    window.removeEventListener('positionsReady', positionsReadyHandler);
                    this.initScentSystem();
                }
            }, 5000);
            
        } else {
            // 沒有延遲需求，直接初始化
            this.initScentSystem();
        }
    }
    
    initScentSystem() {
        // 等待 DOM 完全載入後初始化氣味系統
        setTimeout(() => {
            if (typeof PhysicalScentSystem !== 'undefined') {
                // 獲取視窗尺寸 - 對應 Python 的 floorplan_shape
                const height = window.innerHeight;
                const width = window.innerWidth;
                const floorplanShape = [height, width, 3];  // 對應 Python 的 (600, 800, 3)
                
                this.scentSystem = new PhysicalScentSystem(floorplanShape);
                
                if (this.scentSystem.initCanvas('scent-canvas')) {
                    this.scentSystem.start();
                    console.log('🌬️ 新獨立氣味波系統已啟動');
                    console.log(`📐 地圖尺寸: ${height}x${width}, 降採樣後: ${this.scentSystem.mapHeight}x${this.scentSystem.mapWidth}`);
                    console.log('🎮 按鍵控制: 1=薰衣草(紫), 2=柑橘(橘), 3=尤加利(綠)');
                    console.log('💡 請點擊頁面任意位置後按鍵測試');
                    
                    // 同步設備位置
                    this.syncScentDevicePositions();
                } else {
                    console.error('❌ 氣味系統 Canvas 初始化失敗');
                }
            } else {
                console.error('❌ PhysicalScentSystem 類別未找到');
            }
        }, 100);
    }
    
    syncScentDevicePositions() {
        if (!this.scentSystem) {
            console.warn('⚠️ 氣味系統尚未初始化，無法同步位置');
            return;
        }

        const positions = {};
        document.querySelectorAll('.device-icon[data-device]').forEach(icon => {
            const deviceType = icon.dataset.device;
            const rect = icon.getBoundingClientRect();
            // Get the center of the icon and provide it to the scent system
            positions[deviceType] = [
                rect.left + rect.width / 2,  // centerX
                rect.top + rect.height / 2   // centerY
            ];
        });
        
        this.scentSystem.updateDevicePositions(positions);
        console.log('✅ 氣味釋放點已與按鈕位置同步');
    }
    
    simulateDeviceResponse(deviceType) {
        // Simulate device feedback
        const deviceElement = document.querySelector(`[data-device="${deviceType}"]`);
        if (deviceElement) {
            // 結合中心定位與縮放動畫
            deviceElement.style.transform = 'translate(-50%, 50%) scale(1.1)';
            setTimeout(() => {
                deviceElement.style.transform = 'translate(-50%, 50%) scale(1)';
            }, 200);
        }
        
        // Update spatial view if on spatial page
        if (this.currentPage === 'spatial-page') {
            this.updateSpatialView();
        }
    }
    
    cycleModes() {
        const nextIndex = (this.currentModeIndex + 1) % this.modes.length;
        this.currentModeIndex = nextIndex;
        this.updateUI();
        this.updateModeDisplay();
        this.updateModeDotsDisplay();
        this.triggerModeAnimation();
    }
    
    updateUI() {
        const mode = this.getCurrentMode();
        
        // Update home page
        const homePage = document.querySelector('.home-page');
        const modeTitle = document.getElementById('home-mode-title');
        const modeName = document.getElementById('mode-name');
        const scentBlend = document.getElementById('scent-blend');
        
        if (homePage) {
            // This line was incorrectly making the home page active during any mode change.
            // It has been removed to fix the page switching bug.
            // homePage.className = 'page home-page active';
            console.log(`UI updated for mode: ${mode.name}`);
        }
        
        if (modeTitle) modeTitle.textContent = mode.name;
        if (modeName) modeName.textContent = mode.name;
        if (scentBlend) scentBlend.textContent = mode.blend;
        
        // Update mode circle background
        const wrapper = document.querySelector('.mode-circle-wrapper');
        if (wrapper) {
            // 只保留一個 mode-circle
            let circles = wrapper.querySelectorAll('.mode-circle');
            if (circles.length > 1) {
                for (let i = 0; i < circles.length - 1; i++) wrapper.removeChild(circles[i]);
            }
            const modeCircle = wrapper.querySelector('.mode-circle');
            if (modeCircle) {
                // 根據 mode 設定純色
                const modeColors = {
                    relax: '#FF6B95',
                    focus: '#4FACFE',
                    energize: '#43E97B'
                };
                modeCircle.style.backgroundColor = modeColors[this.currentMode];
                modeCircle.style.backgroundImage = '';
                modeCircle.className = 'mode-circle'; // 移除動畫 class
            }
        }
        
        // Update mode dots
        const modeDots = document.querySelector('.mode-dots');
        if (modeDots) {
            const modeKeys = Object.keys(this.modes);
            const currentIndex = modeKeys.indexOf(this.currentMode);
            
            // 清除滑動動畫class，避免位置偏移
            modeDots.classList.remove('slide-left', 'slide-right');
            
            // 重新建立三個點，並根據當前模式設置active狀態
            modeDots.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
            const dots = Array.from(modeDots.children);
            dots.forEach((dot, index) => {
                dot.classList.toggle('middle', index === currentIndex);
            });
        }
        
        // Update stats
        this.updateStatsDisplay();
        
        // Update device states
        this.updateDeviceUI();
        
        // Update device positions
        this.updateDevicePositions();
        this.updateTriggerTime();
    }

    updateTriggerTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timeString = `${hours}:${minutes}`;

        // 修正選擇器 - HTML 中使用的是 class 而不是 id
        const triggerTime = document.querySelector('.trigger-time');
        if (triggerTime) {
            triggerTime.textContent = `${timeString} Trigger`;
            console.log(`🕐 時間已更新: ${timeString} Trigger`);
        } else {
            console.warn('⚠️ 找不到 .trigger-time 元素');
        }
    }
    
    updateStatsDisplay() {
        const alarmElement = document.querySelector('.stat-row:first-child .stat-value');
        const sleepElement = document.querySelector('.sleep-stat .stat-value');
        const focusElement = document.querySelector('.focus-stat .stat-value');
        
        if (alarmElement) {
            alarmElement.textContent = this.stats.alarm;
        }
        
        if (sleepElement) {
            sleepElement.innerHTML = `
                <span class="change-indicator">${this.stats.sleep.change}</span>
                <span class="time-value">${this.stats.sleep.time}</span>
            `;
        }
        
        if (focusElement) {
            focusElement.innerHTML = `
                <span class.change-indicator">${this.stats.focus.change}</span>
                <span class="time-value">${this.stats.focus.time}</span>
            `;
        }
    }
    
    updateStats() {
        // Simulate realistic stat changes
        const sleepVariations = ['8hr 32m', '8hr 48m', '9hr 15m', '7hr 52m'];
        const focusVariations = ['1hr 03m', '1hr 28m', '2hr 15m', '45m'];
        const sleepChanges = ['+2.2%', '-1.5%', '+3.8%', '-0.8%'];
        const focusChanges = ['+5.8%', '+2.1%', '+7.3%', '-1.2%'];
        
        this.stats.sleep.time = sleepVariations[Math.floor(Math.random() * sleepVariations.length)];
        this.stats.focus.time = focusVariations[Math.floor(Math.random() * focusVariations.length)];
        this.stats.sleep.change = sleepChanges[Math.floor(Math.random() * sleepChanges.length)];
        this.stats.focus.change = focusChanges[Math.floor(Math.random() * focusChanges.length)];
        
        this.stats.sleep.positive = this.stats.sleep.change.startsWith('+');
        this.stats.focus.positive = this.stats.focus.change.startsWith('+');
        
        this.updateStatsDisplay();
    }
    
    triggerModeAnimation() {
        // Mode title animation is removed to prevent z-index issues.
        
        // Animate mode circle
        const modeCircle = document.querySelector('.mode-circle');
        if (modeCircle) {
            modeCircle.style.transform = 'scale(1.1) rotate(5deg)';
            setTimeout(() => {
                modeCircle.style.transform = 'scale(1) rotate(0deg)';
            }, 500);
        }
    }
    
    animatePageTransition(pageId) {
        // 禁用頁面切換動畫，直接顯示頁面
        const page = document.getElementById(pageId);
        if (page) {
            // 不執行任何動畫，直接確保頁面可見
            page.style.transform = 'none';
            page.style.opacity = '1';
        }
    }
    
    updateSpatialView() {
        // Update room devices based on current device states
        const roomDevices = document.querySelectorAll('.room-device');
        const scentAreas = document.querySelectorAll('.scent-area');
        
        roomDevices.forEach(device => {
            const deviceType = device.dataset.device;
            const statusIndicator = device.querySelector('.device-status');
            
            if (deviceType && this.devices[deviceType]) {
                device.classList.add('active');
                if (statusIndicator) {
                    statusIndicator.classList.add('active');
                }
            } else {
                device.classList.remove('active');
                if (statusIndicator) {
                    statusIndicator.classList.remove('active');
                }
            }
        });
        
        // Show/hide scent visualization areas
        scentAreas.forEach(area => {
            const hasActiveDevices = Object.values(this.devices).some(isActive => isActive);
            area.style.display = hasActiveDevices ? 'block' : 'none';
        });
        
        // Update room background based on mode
        const roomBackground = document.querySelector('.room-background');
        if (roomBackground) {
            roomBackground.className = `room-background mode-${this.currentMode}`;
        }
    }
    
    showSpatialDeviceAnimation(deviceElement) {
        // Add visual feedback when device is activated
        deviceElement.style.transform += ' scale(1.2)';
        setTimeout(() => {
            deviceElement.style.transform = deviceElement.style.transform.replace(' scale(1.2)', '');
        }, 200);
        
        // Show scent burst animation
        const burst = document.createElement('div');
        burst.className = 'scent-burst';
        burst.style.cssText = `
            position: absolute;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 20, 147, 0.6) 0%, transparent 70%);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            pointer-events: none;
            z-index: 100;
            animation: scentBurst 1s ease-out forwards;
        `;
        
        deviceElement.appendChild(burst);
        setTimeout(() => burst.remove(), 1000);
    }
    
    showAddDeviceAtPoint(pointElement) {
        const deviceOptions = [
            { name: 'Smart Air Purifier', icon: '💨', price: '$299' },
            { name: 'Ultrasonic Humidifier', icon: '💧', price: '$149' },
            { name: 'Aromatherapy Candle', icon: '🕯️', price: '$39' },
            { name: 'Smart Plant Monitor', icon: '🌱', price: '$79' }
        ];
        
        const randomDevice = deviceOptions[Math.floor(Math.random() * deviceOptions.length)];
        
        const dialog = document.createElement('div');
        dialog.className = 'add-device-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.95);
            padding: 30px;
            border-radius: 20px;
            backdrop-filter: blur(20px);
            z-index: 3000;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            min-width: 280px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        `;
        
        dialog.innerHTML = `
            <div style="font-size: 40px; margin-bottom: 15px;">${randomDevice.icon}</div>
            <h3 style="margin-bottom: 10px; color: #333; font-size: 18px;">${randomDevice.name}</h3>
            <p style="color: #666; margin-bottom: 15px; font-size: 14px;">Perfect for this location</p>
            <p style="color: #FF6B95; margin-bottom: 20px; font-weight: 600; font-size: 16px;">${randomDevice.price}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="this.closest('.add-device-dialog').remove()" style="
                    background: linear-gradient(135deg, #FF6B95 0%, #FFA726 100%);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                ">Add Device</button>
                <button onclick="this.closest('.add-device-dialog').remove()" style="
                    background: rgba(0, 0, 0, 0.1);
                    color: #666;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                ">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Add animation
        setTimeout(() => {
            dialog.style.transform = 'translate(-50%, -50%) scale(1)';
            dialog.style.opacity = '1';
        }, 10);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (dialog.parentElement) {
                dialog.style.transform = 'translate(-50%, -50%) scale(0.8)';
                dialog.style.opacity = '0';
                setTimeout(() => dialog.remove(), 300);
            }
        }, 8000);
    }
    
    showSpatialInfo() {
        // 獲取當前房間的資訊
        const currentRoom = this.rooms[this.currentRoom];
        if (!currentRoom || !currentRoom.info) {
            console.error('找不到當前房間的資訊:', this.currentRoom);
            return;
        }
        
        const roomInfo = currentRoom.info;
        
        const infoDialog = document.createElement('div');
        infoDialog.className = 'spatial-info-dialog';
        infoDialog.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(30, 30, 30, 0.95); color: white; padding: 25px; border-radius: 20px;
            backdrop-filter: blur(20px); z-index: 3000; text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4); max-width: 420px; max-height: 80vh;
            border: 1px solid rgba(255, 255, 255, 0.2); overflow-y: auto;
        `;
        
        // 生成功能列表
        const featuresHtml = roomInfo.features.map(feature => `
            <div style="margin: 12px 0; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <span style="font-weight: 600; color: #fff;">${feature.name}</span>
                    <span style="font-size: 12px; padding: 3px 8px; background: rgba(76, 175, 80, 0.3); color: #4CAF50; border-radius: 12px;">${feature.status}</span>
                </div>
                <p style="font-size: 13px; color: #ccc; margin: 0; line-height: 1.4;">${feature.description}</p>
            </div>
        `).join('');
        
        // 生成環境設定
        const settingsHtml = Object.entries(roomInfo.currentSettings).map(([key, value]) => `
            <div style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px;">
                <span style="color: #ccc; text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1')}:</span>
                <span style="color: #fff; font-weight: 500;">${value}</span>
            </div>
        `).join('');
        
        infoDialog.innerHTML = `
            <h3 style="margin-bottom: 15px; font-size: 20px; font-weight: 600; color: #fff;">${roomInfo.title}</h3>
            
            <div style="text-align: left; margin-bottom: 20px;">
                <p style="color: #ddd; font-size: 15px; line-height: 1.5; margin-bottom: 15px;">${roomInfo.description}</p>
                
                <h4 style="color: #fff; font-size: 16px; margin: 15px 0 10px 0; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🔧</span>Smart Features
                </h4>
                ${featuresHtml}
                
                <h4 style="color: #fff; font-size: 16px; margin: 20px 0 10px 0; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">📊</span>Current Environment
                </h4>
                <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 10px;">
                    ${settingsHtml}
                </div>
                
                <h4 style="color: #fff; font-size: 16px; margin: 20px 0 10px 0; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🤖</span>AI Insights
                </h4>
                <div style="background: rgba(33, 150, 243, 0.1); border-left: 3px solid #2196F3; padding: 12px; border-radius: 0 8px 8px 0;">
                    <p style="color: #e3f2fd; font-size: 14px; line-height: 1.5; margin: 0;">${roomInfo.aiInsights}</p>
                </div>
            </div>
            
            <button onclick="this.closest('.spatial-info-dialog').remove()" style="
                background: rgba(255, 255, 255, 0.2); color: white; border: none; padding: 12px 24px;
                border-radius: 25px; font-weight: 600; cursor: pointer; font-size: 14px;
                transition: background 0.3s ease;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" 
               onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">Close</button>
        `;
        
        document.body.appendChild(infoDialog);
    }

    showHomeInfo() {
        const infoDialog = document.createElement('div');
        infoDialog.className = 'spatial-info-dialog'; // Re-use existing class for styling
        infoDialog.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(30, 30, 30, 0.9); color: white; padding: 30px; border-radius: 20px;
            backdrop-filter: blur(20px); z-index: 3000; text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); max-width: 380px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        infoDialog.innerHTML = `
            <h3 style="margin-bottom: 15px; font-size: 20px; font-weight: 600;">ÔDÔRAI Home Dashboard</h3>
            <div style="text-align: left; margin-bottom: 20px; font-size: 15px; line-height: 1.6; opacity: 0.9;">
                <p>This is a real-time overview of your current space.</p>
                <ul style="margin: 15px 0; padding-left: 20px; list-style: '✨';">
                    <li style="padding-left: 10px;"><strong>Room Tag:</strong> Displays the currently detected primary activity space.</li>
                    <li style="padding-left: 10px;"><strong>Device Cards:</strong> Visually represent your connected smart devices.</li>
                    <li style="padding-left: 10px;"><strong>Trigger Time:</strong> Records the last time a mode was triggered by AI or manually.</li>
                </ul>
                <p>You can switch to different pages using the bottom navigation bar.</p>
            </div>
            <button onclick="this.closest('.spatial-info-dialog').remove()" style="
                background: rgba(255, 255, 255, 0.2); color: white; border: none; padding: 12px 24px;
                border-radius: 25px; font-weight: 600; cursor: pointer; font-size: 14px;
            ">Close</button>
        `;
        document.body.appendChild(infoDialog);
    }



    showHomeInfo() {
        const infoDialog = document.createElement('div');
        infoDialog.className = 'spatial-info-dialog'; // Re-use existing class for styling
        infoDialog.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(30, 30, 30, 0.9); color: white; padding: 30px; border-radius: 20px;
            backdrop-filter: blur(20px); z-index: 3000; text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); max-width: 380px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        infoDialog.innerHTML = `
            <h3 style="margin-bottom: 15px; font-size: 20px; font-weight: 600;">ÔDÔRAI Home Dashboard</h3>
            <div style="text-align: left; margin-bottom: 20px; font-size: 15px; line-height: 1.6; opacity: 0.9;">
                <p>This is a real-time overview of your current space.</p>
                <ul style="margin: 15px 0; padding-left: 20px; list-style: '✨';">
                    <li style="padding-left: 10px;"><strong>Room Tag:</strong> Displays the currently detected primary activity space.</li>
                    <li style="padding-left: 10px;"><strong>Device Cards:</strong> Visually represent your connected smart devices.</li>
                    <li style="padding-left: 10px;"><strong>Trigger Time:</strong> Records the last time a mode was triggered by AI or manually.</li>
                </ul>
                <p>You can switch to different pages using the bottom navigation bar.</p>
            </div>
            <button onclick="this.closest('.spatial-info-dialog').remove()" style="
                background: rgba(255, 255, 255, 0.2); color: white; border: none; padding: 12px 24px;
                border-radius: 25px; font-weight: 600; cursor: pointer; font-size: 14px;
            ">Close</button>
        `;
        document.body.appendChild(infoDialog);
    }

    showModeInfo() {
        const currentModeId = this.getCurrentMode().id;
        const modeData = this.modeInfoData[currentModeId];
        if (!modeData) {
            console.error("Cannot find detailed information for current mode:", currentModeId);
            return;
        }

        const infoDialog = document.createElement('div');
        infoDialog.className = 'spatial-info-dialog';
        infoDialog.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(30, 30, 30, 0.95); color: white; padding: 30px; border-radius: 20px;
            backdrop-filter: blur(20px); z-index: 3000; text-align: left;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); max-width: 420px;
            border: 1px solid rgba(255, 255, 255, 0.2); font-family: 'NCTTorin Regular', sans-serif;
        `;

        const renderList = (items, renderItem) => items.map(renderItem).join('');

        infoDialog.innerHTML = `
            <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; text-align: center;">${modeData.title}</h3>
            
            <h4 style="font-size: 16px; font-weight: 500; opacity: 0.8; margin-bottom: 10px;">Core Scent Formula</h4>
            <ul style="padding: 0; margin: 0 0 20px 0; list-style: none;">
                ${renderList(modeData.coreScents, item => `
                    <li style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 8px 12px; margin-bottom: 5px;">
                        <strong>${item.name}:</strong> <span style="opacity: 0.8;">${item.effect}</span>
                    </li>
                `)}
            </ul>

            <h4 style="font-size: 16px; font-weight: 500; opacity: 0.8; margin-bottom: 10px;">AI Smart Adjustment</h4>
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px; font-size: 14px; line-height: 1.5; opacity: 0.9;">
                ${modeData.aiSummary}
            </div>

            <h4 style="font-size: 16px; font-weight: 500; opacity: 0.8; margin: 20px 0 10px 0;">Expected Benefits</h4>
            <ul style="padding: 0; margin: 0 0 25px 0; list-style: none; display: grid; grid-template-columns: 1fr; gap: 8px;">
                 ${renderList(modeData.benefits, item => `
                    <li style="display: flex; justify-content: space-between; background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 8px 12px;">
                        <span style="opacity: 0.8;">${item.label}:</span> <strong>${item.value}</strong>
                    </li>
                 `)}
            </ul>

            <div style="text-align: center;">
                <button onclick="this.closest('.spatial-info-dialog').remove()" style="
                    background: rgba(255, 255, 255, 0.2); color: white; border: none; padding: 12px 24px;
                    border-radius: 25px; font-weight: 600; cursor: pointer; font-size: 14px;
                ">Close</button>
            </div>
        `;
        document.body.appendChild(infoDialog);
    }
    
    startAutoTrigger() {
        // Simulate automatic scent triggers based on "emotion detection"
        const triggers = [
            { mode: 'relax', reason: 'heart rate elevation detected' },
            { mode: 'focus', reason: 'work session started' },
            { mode: 'energize', reason: 'morning routine detected' }
        ];
        
        // Trigger mode changes every 2-5 minutes for demo
        setInterval(() => {
            const randomTrigger = triggers[Math.floor(Math.random() * triggers.length)];
            this.currentMode = randomTrigger.mode;
            this.updateUI();
            this.showTriggerNotification(randomTrigger.reason);
        }, Math.random() * 180000 + 120000); // 2-5 minutes
    }
    
    showTriggerNotification(reason) {
        // Create and show a subtle notification
        const notification = document.createElement('div');
        notification.className = 'trigger-notification';
        notification.style.cssText = `
            position: fixed;
            top: 60px;
            left: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 16px;
            border-radius: 12px;
            backdrop-filter: blur(20px);
            z-index: 2000;
            font-size: 14px;
            transform: translateY(-100px);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        notification.textContent = `Auto-triggered: ${reason}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateY(-100px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    showAddDeviceDialog() {
        // Simple device addition simulation
        const newDevices = ['Air Purifier', 'Humidifier', 'Smart Blinds', 'Aromatherapy Candle'];
        const randomDevice = newDevices[Math.floor(Math.random() * newDevices.length)];
        
        const dialog = document.createElement('div');
        dialog.className = 'add-device-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.95);
            padding: 30px;
            border-radius: 20px;
            backdrop-filter: blur(20px);
            z-index: 3000;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            min-width: 250px;
        `;
        
        dialog.innerHTML = `
            <h3 style="margin-bottom: 15px; color: #333;">Add New Device</h3>
            <p style="color: #666; margin-bottom: 20px;">Found: ${randomDevice}</p>
            <button onclick="this.parentElement.remove()" style="
                background: linear-gradient(135deg, #FF6B95 0%, #FFA726 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                margin-right: 10px;
            ">Connect</button>
            <button onclick="this.parentElement.remove()" style="
                background: rgba(0, 0, 0, 0.1);
                color: #666;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
            ">Cancel</button>
        `;
        
        document.body.appendChild(dialog);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (dialog.parentElement) {
                dialog.remove();
            }
        }, 5000);
    }






    

    

    










    getModeData(mode) {
        const modeDataMap = {
            relax: {
                title: "Yves's RELAX Formula",
                adjustments: [
                    {
                        type: "+",
                        ingredient: "Lavender",
                        change: "(15% ▲)",
                        reason: "To enhance your deep sleep quality"
                    },
                    {
                        type: "+",
                        ingredient: "NEW: Bergamot",
                        change: "",
                        reason: "Balanced scent with gentle euphoric feeling"
                    }
                ],
                coreScents: [
                    { name: "Lavender", effect: "Deep calming & soothing" },
                    { name: "Bergamot", effect: "Anxiety relief & emotional balance" },
                    { name: "Frankincense", effect: "Meditation guidance & spiritual relaxation" }
                ],
                aiSummary: "Based on your sleep data last month (average sleep onset ▲5%) and heart rate feedback, AI increased 'Lavender' ratio to strengthen sleep-aid effects and introduced 'Bergamot' to gently balance your emotions.",
                benefits: [
                    { label: "Expected Sleep Improvement", value: "+8.5%" },
                    { label: "Expected Stress Reduction", value: "-12.3%" }
                ]
            },
            focus: {
                title: "Yves's FOCUS Formula",
                adjustments: [
                    {
                        type: "+",
                        ingredient: "Rosemary",
                        change: "(20% ▲)",
                        reason: "To boost your cognitive performance"
                    },
                    {
                        type: "+",
                        ingredient: "NEW: Lemon",
                        change: "",
                        reason: "Mental clarity and alertness enhancement"
                    }
                ],
                coreScents: [
                    { name: "Rosemary", effect: "Memory enhancement & mental clarity" },
                    { name: "Lemon", effect: "Alertness boost & mood elevation" },
                    { name: "Peppermint", effect: "Sustained focus & mental energy" }
                ],
                aiSummary: "Your productivity tracking showed 12% decreased focus time last month. AI enhanced 'Rosemary' concentration and added 'Lemon' for mental sharpness. Your workflow patterns suggest peak performance between 9-11 AM.",
                benefits: [
                    { label: "Expected Focus Improvement", value: "+11.2%" },
                    { label: "Expected Productivity Boost", value: "+9.7%" }
                ]
            },
            energize: {
                title: "Yves's ENERGIZE Formula", 
                adjustments: [
                    {
                        type: "+",
                        ingredient: "Grapefruit",
                        change: "(18% ▲)",
                        reason: "To increase your morning vitality"
                    },
                    {
                        type: "+",
                        ingredient: "NEW: Ginger",
                        change: "",
                        reason: "Natural energy boost without caffeine crash"
                    }
                ],
                coreScents: [
                    { name: "Grapefruit", effect: "Natural stimulation & mood lift" },
                    { name: "Ginger", effect: "Energy boost & mental invigoration" },
                    { name: "Lemongrass", effect: "Sustained vitality & freshness" }
                ],
                aiSummary: "Your energy levels showed a 15% dip in afternoons last month. AI boosted 'Grapefruit' for natural stimulation and introduced 'Ginger' for sustained energy without the typical 3 PM crash you experienced.",
                benefits: [
                    { label: "Expected Energy Increase", value: "+13.8%" },
                    { label: "Expected Mood Enhancement", value: "+10.4%" }
                ]
            }
        };
        
        return modeDataMap[mode] || modeDataMap.relax;
    }

    setupWebSocket() {
        // 自動檢測是本機還是局域網訪問
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const wsHost = isLocalhost ? 'localhost' : window.location.hostname;
        const wsUrl = `ws://${wsHost}:8080`;
        
        console.log(`🔗 正在嘗試連接 WebSocket: ${wsUrl}`);
        console.log(`🌐 當前位置: ${window.location.href}`);
        console.log(`📱 用戶代理: ${navigator.userAgent}`);
        
        // 清理舊的WebSocket連接
        if (this.ws) {
            this.ws.close();
        }
        
        this.ws = new WebSocket(wsUrl);
        this.wsConnected = false;

        this.ws.onopen = () => {
            console.log('✅ WebSocket 已成功連線到伺服器！');
            console.log(`🔗 WebSocket 狀態: ${this.ws.readyState}`);
            this.wsConnected = true;
            
            // 僅保留console日誌，移除視覺提示
            // this.showConnectionStatus('✅ WebSocket 連接成功！', '#00ff00');
        };

        this.ws.onmessage = (event) => {
            console.log('📱🔄 從 WebSocket 伺服器收到訊息:', event.data);
            try {
                const data = JSON.parse(event.data);
                console.log('📱📊 解析後的數據:', data);

                // 檢查收到的資料是否包含 deviceId 和 newImage
                if (data.deviceId && data.newImage) {
                    console.log(`📱🔍 收到圖片更新請求: Device ${data.deviceId} → ${data.newImage}`);
                    
                    // 檢查檔案是否存在
                    const imgPath = `./assets/images/${data.newImage}`;
                    const testImg = new Image();
                    
                    testImg.onload = () => {
                        console.log(`📱✅ 圖片檔案存在: ${data.newImage}`);
                        
                        // 直接更新圖片
                        const imgElementId = `raspberry-pi-${data.deviceId}-img`;
                        const imgElement = document.getElementById(imgElementId);
                        
                        if (imgElement) {
                            const oldSrc = imgElement.src;
                            imgElement.src = imgPath;
                            console.log(`📱✅ 已更新圖片元素 #${imgElementId}`);
                            console.log(`📱🔄 舊圖片: ${oldSrc}`);
                            console.log(`📱🆕 新圖片: ${imgElement.src}`);
                        } else {
                            console.warn(`📱⚠️ 找不到對應的圖片元素: #${imgElementId}`);
                        }
                    };
                    
                    testImg.onerror = () => {
                        console.error(`📱❌ 圖片檔案不存在: ${data.newImage}`);
                        console.log(`📱💡 可用的圖片檔案: prototype1.png 到 prototype8.png`);
                        
                        // 顯示錯誤提示
                        this.showConnectionStatus(`❌ 圖片檔案不存在: ${data.newImage}`, '#ff0000');
                    };
                    
                    testImg.src = imgPath;
                } else {
                    console.log('📱❓ 訊息不包含有效的 deviceId 或 newImage:', data);
                }
            } catch (error) {
                console.error('📱💥 處理 WebSocket 訊息時發生錯誤:', error);
            }
        };

        this.ws.onclose = () => {
            console.log('🔌 WebSocket 連線已關閉。將在3秒後嘗試重新連線...');
            console.log(`📊 關閉時的狀態: ${this.ws.readyState}`);
            this.wsConnected = false;
            
            // 移除重連提示，僅保留console日誌
            // this.showConnectionStatus('🔄 WebSocket 重新連線中...', '#ff9900');
            
            // 簡單的重新連線機制
            setTimeout(() => {
                console.log('🔄 正在重新連線 WebSocket...');
                this.setupWebSocket();
            }, 3000);
        };

        this.ws.onerror = (error) => {
            console.error('❌ WebSocket 發生錯誤:', error);
            console.log(`📊 錯誤時的狀態: ${this.ws.readyState}`);
            this.wsConnected = false;
            
            // 顯示錯誤提示
            this.showConnectionStatus('❌ WebSocket 連接失敗！', '#ff0000');
            
            // 當發生錯誤時，瀏覽器的 onclose 事件通常也會被觸發，
            // 所以重連邏輯會在那裡處理。
        };
    }

    // 顯示連接狀態的視覺提示
    showConnectionStatus(message, color) {
        // 移除舊的狀態提示
        const oldStatus = document.getElementById('ws-connection-status');
        if (oldStatus) {
            oldStatus.remove();
        }

        // 創建新的狀態提示
        const statusDiv = document.createElement('div');
        statusDiv.id = 'ws-connection-status';
        statusDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: ${color};
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10001;
            border: 2px solid ${color};
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        statusDiv.textContent = message;
        document.body.appendChild(statusDiv);
        
        // 自動移除（除了錯誤訊息）
        if (!message.includes('失敗') && !message.includes('錯誤')) {
            setTimeout(() => {
                if (statusDiv.parentElement) {
                    statusDiv.remove();
                }
            }, 3000);
        }
    }

    // 改進的圖片更新函數，包含錯誤處理和視覺回饋
    updateRaspberryPiImage(deviceId, newImage) {
        console.log(`🖼️ 嘗試更新 Device ${deviceId} 圖片為: ${newImage}`);
        
        const imgElementId = `raspberry-pi-${deviceId}-img`;
        const imgElement = document.getElementById(imgElementId);
        
        if (!imgElement) {
            console.error(`❌ 找不到圖片元素: #${imgElementId}`);
            this.showConnectionStatus(`❌ 找不到圖片元素 #${imgElementId}`, '#ff0000');
            return false;
        }

        // 檢查檔案是否存在
        const imgPath = `./assets/images/${newImage}`;
        const testImg = new Image();
        
        testImg.onload = () => {
            console.log(`✅ 圖片檔案存在: ${newImage}`);
            const oldSrc = imgElement.src;
            imgElement.src = imgPath;
            
            console.log(`✅ 已更新圖片元素 #${imgElementId}`);
            console.log(`🔄 舊圖片: ${oldSrc}`);
            console.log(`🆕 新圖片: ${imgElement.src}`);
            
            // 強制觸發圖片重新載入確認
            imgElement.onload = () => {
                console.log(`🎉 圖片在頁面上載入成功: ${newImage}`);
            };
            imgElement.onerror = () => {
                console.error(`❌ 圖片在頁面上載入失敗: ${newImage}`);
                this.showConnectionStatus(`❌ 圖片載入失敗: ${newImage}`, '#ff0000');
            };
        };
        
        testImg.onerror = () => {
            console.error(`❌ 圖片檔案不存在: ${newImage}`);
            this.showConnectionStatus(`❌ 圖片檔案不存在: ${newImage}`, '#ff0000');
        };
        
        testImg.src = imgPath;
        return true;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ÔDÔRAI app...');
    window.odoraiApp = new OdoraiApp();
    console.log('ÔDÔRAI app initialized');
});

// Additional utility functions for advanced interactions
const OdoraiUtils = {
    // Simulate sensor data
    generateSensorData() {
        return {
            heartRate: Math.floor(Math.random() * 40) + 60,
            emotionScore: Math.random(),
            ambientLight: Math.floor(Math.random() * 100),
            temperature: Math.floor(Math.random() * 10) + 20,
            humidity: Math.floor(Math.random() * 30) + 40
        };
    },
    
    // Format time for display
    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    },
    
    // Calculate scent intensity based on room size and airflow
    calculateScentIntensity(roomSize = 100, airflow = 50) {
        const baseIntensity = 0.7;
        const sizeMultiplier = Math.min(roomSize / 100, 2);
        const airflowMultiplier = Math.min(airflow / 50, 1.5);
        return Math.min(baseIntensity * sizeMultiplier * airflowMultiplier, 1);
    },
    
    // Generate realistic scent blend combinations
    generateScentBlend(mode) {
        const blends = {
            relax: [
                'Lavender + Bergamot + Cedarwood',
                'Chamomile + Vanilla + Sandalwood',
                'Ylang-Ylang + Rose + Patchouli'
            ],
            focus: [
                'Peppermint + Rosemary + Eucalyptus',
                'Lemon + Basil + Pine',
                'Frankincense + Sage + Juniper'
            ],
            energize: [
                'Citrus + Ginger + Lemongrass',
                'Orange + Cinnamon + Clove',
                'Grapefruit + Mint + Lime'
            ]
        };
        
        const modeBlends = blends[mode] || blends.relax;
        return modeBlends[Math.floor(Math.random() * modeBlends.length)];
    }
};

// Global scent system tools
window.startScents = () => {
    if (window.odoraiApp && window.odoraiApp.scentSystem) {
        window.odoraiApp.scentSystem.start();
        console.log('🎬 氣味系統已啟動');
        return true;
    }
    console.error('❌ 氣味系統未初始化');
    return false;
};

window.stopScents = () => {
    if (window.odoraiApp && window.odoraiApp.scentSystem) {
        window.odoraiApp.scentSystem.stop();
        console.log('⏹️ 氣味系統已停止');
        return true;
    }
    console.error('❌ 氣味系統未初始化');
    return false;
};

window.clearAllScents = () => {
    if (window.odoraiApp && window.odoraiApp.scentSystem) {
        window.odoraiApp.scentSystem.clearAllScents();
        console.log('🧹 所有氣味已清除');
        return true;
    }
    console.error('❌ 氣味系統未初始化');
    return false;
};

window.getScentStatus = () => {
    if (window.odoraiApp && window.odoraiApp.scentSystem) {
        const status = window.odoraiApp.scentSystem.getDeviceStatus();
        const waveCount = window.odoraiApp.scentSystem.getActiveWaveCount();
        console.log('🌬️ 氣味系統狀態:', status);
        console.log(`💨 活躍氣味波: ${waveCount}`);
        return { devices: status, activeWaves: waveCount };
    }
    console.error('❌ 氣味系統未初始化');
    return null;
};

// 全域測試工具 - 測試模式圖片顯示
window.testModeDisplay = () => {
    if (window.odoraiApp) {
        console.log('🧪 測試方法1 (HTML重建)');
        window.odoraiApp.updateModeDisplay();
        return true;
    }
    console.error('ÔDÔRAI app 尚未初始化');
    return false;
};

window.testBackgroundMethod = () => {
    if (window.odoraiApp) {
        console.log('🧪 測試方法2 (CSS背景圖片)');
        window.odoraiApp.updateModeDisplayWithBackground();
        return true;
    }
    console.error('ÔDÔRAI app 尚未初始化');
    return false;
};

// 📝 測試英文模式資訊顯示
window.testEnglishModeInfo = () => {
    console.log('📝 測試英文模式資訊顯示...');
    
    if (!window.odoraiApp) {
        console.error('❌ ÔDÔRAI app 未初始化');
        return false;
    }
    
    // 切換到 MODE PAGE
    window.odoraiApp.switchPage('mode-page');
    
    // 測試所有模式的英文資訊
    const modes = ['RELAX', 'FOCUS', 'SLEEP', 'FRESH', 'HAPPY'];
    let testIndex = 0;
    
    const testNextMode = () => {
        if (testIndex >= modes.length) {
            console.log('✅ 所有英文模式資訊測試完成！');
            return;
        }
        
        const modeName = modes[testIndex];
        console.log(`\n📝 測試模式: ${modeName} (${testIndex + 1}/${modes.length})`);
        
        // 切換到指定模式
        window.odoraiApp.currentModeIndex = testIndex;
        window.odoraiApp.updateModeDisplay();
        window.odoraiApp.updateModeDotsDisplay();
        
        setTimeout(() => {
            // 檢查 modeInfoData 是否存在英文內容
            const currentMode = window.odoraiApp.getCurrentMode();
            const modeData = window.odoraiApp.modeInfoData[currentMode.id];
            
            if (modeData) {
                console.log(`📋 標題: ${modeData.title}`);
                console.log(`📋 AI描述: ${modeData.aiSummary.substring(0, 50)}...`);
                console.log(`📋 香味配方: ${modeData.coreScents.map(s => s.name).join(', ')}`);
                console.log(`📋 效果: ${modeData.benefits.map(b => b.label).join(', ')}`);
                
                // 檢查是否為英文
                const hasEnglish = /[a-zA-Z]/.test(modeData.aiSummary);
                if (hasEnglish) {
                    console.log('✅ 模式資訊已為英文！');
                } else {
                    console.error('❌ 模式資訊仍為中文');
                }
            } else {
                console.error(`❌ 找不到 ${modeName} 模式的資訊`);
            }
            
            testIndex++;
            setTimeout(testNextMode, 1000);
        }, 500);
    };
    
    testNextMode();
    return true;
};

// 🕐 測試實時時間更新功能
window.testTimeUpdate = () => {
    console.log('🕐 測試實時時間更新功能...');
    
    if (!window.odoraiApp) {
        console.error('❌ ÔDÔRAI app 未初始化');
        return false;
    }
    
    // 切換到 HOME PAGE 以查看時間
    window.odoraiApp.switchPage('home-page');
    
    setTimeout(() => {
        const triggerTimeElement = document.querySelector('.trigger-time');
        if (triggerTimeElement) {
            const currentTime = triggerTimeElement.textContent;
            console.log(`✅ 找到時間元素: "${currentTime}"`);
            
            // 手動測試時間更新
            window.odoraiApp.updateTriggerTime();
            
            setTimeout(() => {
                const updatedTime = triggerTimeElement.textContent;
                console.log(`🔄 更新後時間: "${updatedTime}"`);
                
                // 檢查時間格式
                const timeRegex = /^\d{2}:\d{2} Trigger$/;
                if (timeRegex.test(updatedTime)) {
                    console.log('✅ 時間格式正確 (HH:MM Trigger)');
                    
                    // 檢查是否為當前時間
                    const now = new Date();
                    const expectedHours = String(now.getHours()).padStart(2, '0');
                    const expectedMinutes = String(now.getMinutes()).padStart(2, '0');
                    const expectedTime = `${expectedHours}:${expectedMinutes} Trigger`;
                    
                    if (updatedTime === expectedTime) {
                        console.log('✅ 顯示的是當前實際時間！');
                        console.log('🎉 實時時間功能測試成功！');
                    } else {
                        console.log(`⚠️ 時間可能有1分鐘差異，這是正常的`);
                        console.log(`期望: ${expectedTime}, 實際: ${updatedTime}`);
                    }
                } else {
                    console.error('❌ 時間格式不正確');
                }
            }, 100);
        } else {
            console.error('❌ 找不到時間元素 (.trigger-time)');
        }
    }, 500);
    
    return true;
};

// 🔄 測試 HOME PAGE 和 MODE PAGE 同步功能
window.testHomeModSync = () => {
    console.log('🔄 測試 HOME PAGE 和 MODE PAGE 同步功能...');
    
    if (!window.odoraiApp) {
        console.error('❌ ÔDÔRAI app 未初始化');
        return false;
    }
    
    // 自動循環測試所有模式
    const modes = ['RELAX', 'FOCUS', 'SLEEP', 'FRESH', 'HAPPY'];
    let currentTestIndex = 0;
    
    const testNextMode = () => {
        if (currentTestIndex >= modes.length) {
            console.log('✅ 所有模式同步測試完成！');
            return;
        }
        
        const modeName = modes[currentTestIndex];
        console.log(`\n🔄 測試模式: ${modeName} (${currentTestIndex + 1}/${modes.length})`);
        
        // 切換模式
        window.odoraiApp.currentModeIndex = currentTestIndex;
        window.odoraiApp.updateModeDisplay();
        window.odoraiApp.updateModeDotsDisplay();
        
        setTimeout(() => {
            // 檢查 MODE PAGE 的圖片
            const modePageImg = document.querySelector('#mode-page .relax-title-img');
            const modePageSrc = modePageImg ? modePageImg.src : 'NOT FOUND';
            
            // 檢查 HOME PAGE 的圖片
            const homePageImg = document.querySelector('#home-page .main-title-img');
            const homePageSrc = homePageImg ? homePageImg.src : 'NOT FOUND';
            
            // 檢查香味描述
            const scentDesc = document.querySelector('.scent-description');
            const scentText = scentDesc ? scentDesc.textContent : 'NOT FOUND';
            
            console.log(`📱 MODE PAGE 圖片: ${modePageSrc.split('/').pop()}`);
            console.log(`🏠 HOME PAGE 圖片: ${homePageSrc.split('/').pop()}`);
            console.log(`🌸 香味配方: ${scentText}`);
            
            // 檢查是否同步
            const isSync = modePageSrc.includes(modeName) && homePageSrc.includes(modeName);
            if (isSync) {
                console.log(`✅ ${modeName} 模式同步成功！`);
            } else {
                console.error(`❌ ${modeName} 模式同步失敗！`);
            }
            
            currentTestIndex++;
            setTimeout(testNextMode, 1000);
        }, 500);
    };
    
    // 開始測試
    testNextMode();
    return true;
};

// 快速測試香味描述顯示修復
window.testScentFix = () => {
    console.log('🧪 測試香味描述修復...');
    
    if (!window.odoraiApp) {
        console.error('❌ ÔDÔRAI app 未初始化');
        return false;
    }
    
    // 切換到 MODE PAGE
    window.odoraiApp.switchPage('mode-page');
    
    setTimeout(() => {
        const scentDesc = document.querySelector('.scent-description');
        if (scentDesc) {
            console.log('✅ 找到香味描述元素');
            console.log('📝 當前內容:', `"${scentDesc.textContent}"`);
            
            // 檢查樣式
            const styles = window.getComputedStyle(scentDesc);
            console.log('🎨 樣式檢查:');
            console.log('   顏色:', styles.color);
            console.log('   z-index:', styles.zIndex);
            console.log('   背景:', styles.background);
            console.log('   邊框:', styles.border);
            console.log('   字體大小:', styles.fontSize);
            console.log('   位置 top:', styles.top);
            
            // 強制更新內容測試
            const originalText = scentDesc.textContent;
            scentDesc.textContent = '🌸 修復測試 - Lavender + Chamomile + Juniper';
            console.log('🔧 已更新測試文字');
            
            // 恢復原始內容
            setTimeout(() => {
                scentDesc.textContent = originalText;
                console.log('🔄 已恢復原始內容');
            }, 2000);
            
        } else {
            console.error('❌ 找不到香味描述元素');
        }
    }, 500);
    
    return true;
};

// 調試香味描述元素
window.debugScentDescription = () => {
    console.log('🔍 調試香味描述元素...');
    
    // 切換到 MODE PAGE
    if (window.odoraiApp) {
        window.odoraiApp.switchPage('mode-page');
        
        setTimeout(() => {
            const scentDesc = document.querySelector('.scent-description');
            console.log('📝 香味描述元素:', scentDesc);
            
            if (scentDesc) {
                const styles = window.getComputedStyle(scentDesc);
                console.log('📍 元素位置和樣式:');
                console.log('   - 顯示狀態:', styles.display);
                console.log('   - 可見性:', styles.visibility);
                console.log('   - 透明度:', styles.opacity);
                console.log('   - z-index:', styles.zIndex);
                console.log('   - 位置:', styles.position);
                console.log('   - top:', styles.top);
                console.log('   - left:', styles.left);
                console.log('   - 寬度:', scentDesc.offsetWidth + 'px');
                console.log('   - 高度:', scentDesc.offsetHeight + 'px');
                console.log('   - 內容:', `"${scentDesc.textContent}"`);
                console.log('   - 字體:', styles.fontFamily);
                console.log('   - 字體大小:', styles.fontSize);
                console.log('   - 顏色:', styles.color);
                console.log('   - 背景:', styles.background);
                
                // 強制設置樣式確保可見
                scentDesc.style.display = 'block';
                scentDesc.style.visibility = 'visible';
                scentDesc.style.opacity = '1';
                scentDesc.style.zIndex = '100';
                scentDesc.style.backgroundColor = 'rgba(255, 255, 0, 0.3)'; // 黃色背景方便看見
                scentDesc.style.border = '2px solid red'; // 紅色邊框方便看見
                scentDesc.style.padding = '10px';
                
                console.log('🔧 已強制設置可見樣式 (黃色背景 + 紅色邊框)');
                
                // 測試更新文字
                setTimeout(() => {
                    scentDesc.textContent = '🧪 測試香味配方文字 - Test Scent Description';
                    console.log('📝 已更新測試文字');
                }, 1000);
                
            } else {
                console.error('❌ 找不到 .scent-description 元素');
                
                // 檢查 MODE PAGE 是否存在
                const modePage = document.getElementById('mode-page');
                if (modePage) {
                    console.log('📄 MODE PAGE 存在，檢查其HTML結構...');
                    console.log(modePage.innerHTML.substring(0, 500) + '...');
                } else {
                    console.error('❌ MODE PAGE 不存在');
                }
            }
        }, 500);
        
        return true;
    } else {
        console.error('❌ ÔDÔRAI app 未初始化');
        return false;
    }
};

// 測試香味配方顯示
window.testScentDisplay = () => {
    console.log('🌸 測試所有模式的香味配方顯示...');
    
    if (!window.odoraiApp) {
        console.error('❌ ÔDÔRAI app 未初始化');
        return false;
    }
    
    // 切換到 MODE PAGE
    window.odoraiApp.switchPage('mode-page');
    
    const modes = [
        { name: 'RELAX', blend: 'Oud Wood + Orange + Frankincense' },
        { name: 'FOCUS', blend: 'Jasmine + Eucalyptus + Peppermint' },
        { name: 'SLEEP', blend: 'Lavender + Chamomile + Juniper' },
        { name: 'FRESH', blend: 'Lemon + Green Tea + Cypress' },
        { name: 'HAPPY', blend: 'Orange Blossom + Freesia + Peach' }
    ];
    
    let testIndex = 0;
    
    const testNextMode = () => {
        if (testIndex >= modes.length) {
            console.log('✅ 所有香味配方測試完成！');
            return;
        }
        
        // 切換到指定模式
        window.odoraiApp.currentModeIndex = testIndex;
        window.odoraiApp.updateModeDisplay();
        window.odoraiApp.updateModeDotsDisplay();
        
        setTimeout(() => {
            const scentDesc = document.querySelector('.scent-description');
            if (scentDesc) {
                const displayedText = scentDesc.textContent;
                const expectedText = modes[testIndex].blend;
                
                if (displayedText === expectedText) {
                    console.log(`✅ ${modes[testIndex].name}: ${displayedText}`);
                } else {
                    console.error(`❌ ${modes[testIndex].name}: 期望 "${expectedText}", 實際 "${displayedText}"`);
                }
            } else {
                console.error(`❌ ${modes[testIndex].name}: 找不到香味描述元素`);
            }
            
            testIndex++;
            setTimeout(testNextMode, 800);
        }, 500);
    };
    
    testNextMode();
    return true;
};

// 測試所有模式的 info 功能
window.testAllModeInfo = () => {
    console.log('🧪 測試所有 5 個模式的 info 功能...');
    
    if (!window.odoraiApp) {
        console.error('❌ ÔDÔRAI app 未初始化');
        return false;
    }
    
    // 切換到 MODE PAGE
    window.odoraiApp.switchPage('mode-page');
    
    const modeNames = ['RELAX', 'FOCUS', 'SLEEP', 'FRESH', 'HAPPY'];
    let testIndex = 0;
    
    const testNextMode = () => {
        if (testIndex >= 5) {
            console.log('✅ 所有模式測試完成！');
            return;
        }
        
        // 切換到指定模式
        window.odoraiApp.currentModeIndex = testIndex;
        window.odoraiApp.updateModeDisplay();
        window.odoraiApp.updateModeDotsDisplay();
        
        console.log(`🔄 測試模式 ${testIndex + 1}/5: ${modeNames[testIndex]}`);
        
        setTimeout(() => {
            // 檢查 modeInfoData 是否存在
            const currentMode = window.odoraiApp.getCurrentMode();
            const modeData = window.odoraiApp.modeInfoData[currentMode.id];
            
            if (modeData) {
                console.log(`✅ ${modeNames[testIndex]} - 數據存在:`, modeData.title);
                
                // 測試點擊 info 按鈕
                try {
                    window.odoraiApp.showModeInfo();
                    console.log(`✅ ${modeNames[testIndex]} - info 彈窗正常`);
                    
                    // 關閉彈窗
                    setTimeout(() => {
                        const dialog = document.querySelector('.spatial-info-dialog');
                        if (dialog) {
                            dialog.remove();
                        }
                        testIndex++;
                        testNextMode();
                    }, 500);
                    
                } catch (error) {
                    console.error(`❌ ${modeNames[testIndex]} - info 功能錯誤:`, error);
                    testIndex++;
                    testNextMode();
                }
            } else {
                console.error(`❌ ${modeNames[testIndex]} - 缺少數據，模式ID: ${currentMode.id}`);
                testIndex++;
                testNextMode();
            }
        }, 500);
    };
    
    testNextMode();
    return true;
};

// 測試 MODE PAGE 完整功能
window.testModePageFunctions = () => {
    console.log('🧪 測試 MODE PAGE 完整功能...');
    
    // 測試切換到 MODE PAGE
    if (window.odoraiApp) {
        window.odoraiApp.switchPage('mode-page');
        console.log('✅ 已切換到 MODE PAGE');
        
        // 測試香味描述顯示
        setTimeout(() => {
            const scentDesc = document.querySelector('.scent-description');
            if (scentDesc) {
                console.log('🌸 當前香味描述:', scentDesc.textContent);
                
                // 測試模式切換時香味描述更新
                const originalMode = window.odoraiApp.currentModeIndex;
                console.log('🔄 測試切換模式...');
                
                // 切換到 FOCUS 模式 (index 1)
                window.odoraiApp.currentModeIndex = 1;
                window.odoraiApp.updateModeDisplay();
                
                setTimeout(() => {
                    console.log('🌿 FOCUS 模式香味:', document.querySelector('.scent-description').textContent);
                    
                    // 切換到 SLEEP 模式 (index 2)
                    window.odoraiApp.currentModeIndex = 2;
                    window.odoraiApp.updateModeDisplay();
                    
                    setTimeout(() => {
                        console.log('😴 SLEEP 模式香味:', document.querySelector('.scent-description').textContent);
                        
                        // 恢復原始模式
                        window.odoraiApp.currentModeIndex = originalMode;
                        window.odoraiApp.updateModeDisplay();
                        console.log('🔙 已恢復原始模式');
                    }, 500);
                }, 500);
            } else {
                console.error('❌ 找不到香味描述元素');
            }
        }, 500);
        
        // 測試 info button
        setTimeout(() => {
            const infoIcon = document.querySelector('#mode-page .info-icon');
            if (infoIcon) {
                console.log('ℹ️ 找到 info button，測試點擊功能...');
                infoIcon.click();
                console.log('✅ info button 點擊測試完成');
            } else {
                console.error('❌ 找不到 MODE PAGE 的 info button');
            }
        }, 1000);
        
        return true;
    } else {
        console.error('❌ ÔDÔRAI app 未初始化');
        return false;
    }
};

// 調試工具 - 檢查圖片元素狀態
window.debugModeImages = () => {
    console.log('🔍 檢查 MODE PAGE 圖片狀態...');
    
    // 檢查容器
    const container = document.querySelector('.mode-image-container');
    console.log('📦 模式圖片容器:', container);
    if (container) {
        console.log('   - 位置:', window.getComputedStyle(container).position);
        console.log('   - 尺寸:', container.offsetWidth + 'x' + container.offsetHeight);
        console.log('   - 可見性:', window.getComputedStyle(container).visibility);
    }
    
    // 檢查圓形容器
    const pinkCircle = document.querySelector('.pink-circle');
    console.log('🟣 粉紅色圓形容器:', pinkCircle);
    if (pinkCircle) {
        console.log('   - 位置:', window.getComputedStyle(pinkCircle).position);
        console.log('   - 尺寸:', pinkCircle.offsetWidth + 'x' + pinkCircle.offsetHeight);
        console.log('   - z-index:', window.getComputedStyle(pinkCircle).zIndex);
    }
    
    // 檢查圓形圖片
    const circleImg = document.querySelector('.circle-image');
    console.log('🖼️ 圓形圖片:', circleImg);
    if (circleImg) {
        console.log('   - src:', circleImg.src);
        console.log('   - 尺寸:', circleImg.offsetWidth + 'x' + circleImg.offsetHeight);
        console.log('   - 載入狀態:', circleImg.complete ? '✅ 已載入' : '⏳ 載入中');
        console.log('   - 可見性:', window.getComputedStyle(circleImg).visibility);
        console.log('   - 透明度:', window.getComputedStyle(circleImg).opacity);
        console.log('   - z-index:', window.getComputedStyle(circleImg).zIndex);
    }
    
    // 檢查標題圖片
    const titleImg = document.querySelector('.relax-title-img');
    console.log('📝 標題圖片:', titleImg);
    if (titleImg) {
        console.log('   - src:', titleImg.src);
        console.log('   - 尺寸:', titleImg.offsetWidth + 'x' + titleImg.offsetHeight);
        console.log('   - 載入狀態:', titleImg.complete ? '✅ 已載入' : '⏳ 載入中');
    }
    
    // 檢查當前頁面
    const modePage = document.getElementById('mode-page');
    console.log('📄 MODE PAGE:', modePage);
    if (modePage) {
        console.log('   - 是否激活:', modePage.classList.contains('active'));
        console.log('   - 顯示狀態:', window.getComputedStyle(modePage).display);
    }
    
    return {
        container: !!container,
        pinkCircle: !!pinkCircle,
        circleImg: !!circleImg,
        titleImg: !!titleImg,
        pageActive: modePage?.classList.contains('active')
    };
};

// Global developer tools
window.editDevicePositions = () => {
    if (window.odoraiApp) {
        const isEditMode = window.odoraiApp.togglePositionEditMode();
        if (isEditMode) {
            console.log('🎯 設備位置編輯模式已開啟！');
            console.log('📱 你可以直接拖動設備圖標來調整位置');
            console.log('💡 拖動完成後，控制台會顯示 CSS 代碼');
            console.log('🔄 再次執行 editDevicePositions() 來關閉編輯模式');
        } else {
            console.log('✅ 設備位置編輯模式已關閉');
        }
        return isEditMode;
    }
    console.error('ÔDÔRAI app 尚未初始化');
    return false;
};

window.getDevicePositions = () => {
    if (window.odoraiApp) {
        const mode = window.odoraiApp.currentMode;
        const positions = window.odoraiApp.devicePositions[mode];
        console.log(`當前模式 ${mode} 的設備位置:`, positions);
        return positions;
    }
    console.error('ÔDÔRAI app 尚未初始化');
    return null;
};

window.setDevicePosition = (device, position) => {
    if (window.odoraiApp) {
        const mode = window.odoraiApp.currentMode;
        if (!window.odoraiApp.devicePositions[mode]) {
            window.odoraiApp.devicePositions[mode] = {};
        }
        window.odoraiApp.devicePositions[mode][device] = position;
        window.odoraiApp.updateDevicePositions();
        console.log(`✅ ${device} 位置已更新:`, position);
        return true;
    }
    console.error('ÔDÔRAI app 尚未初始化');
    return false;
};

// 快速微調工具
window.adjustPosition = (device, deltaX, deltaY) => {
    if (window.odoraiApp) {
        const mode = window.odoraiApp.currentMode;
        const currentPos = window.odoraiApp.devicePositions[mode][device];
        
        if (currentPos) {
            const newLeft = parseInt(currentPos.left) + deltaX;
            const newBottom = parseInt(currentPos.bottom) + deltaY;
            
            window.setDevicePosition(device, {
                left: `${newLeft}px`,
                bottom: `${newBottom}px`
            });
            
            console.log(`🎯 ${device} 微調: X${deltaX > 0 ? '+' : ''}${deltaX}, Y${deltaY > 0 ? '+' : ''}${deltaY}`);
        }
    }
};

// 🧪 iPad Safari 測試函數 - 模擬 Raspberry Pi 訊息
window.testWebSocketUpdate = (deviceId = "1", newImage = "prototype2.png") => {
    console.log(`🧪 模擬 WebSocket 訊息: deviceId=${deviceId}, newImage=${newImage}`);
    
    const imgElementId = `raspberry-pi-${deviceId}-img`;
    const imgElement = document.getElementById(imgElementId);
    
    if (imgElement) {
        const oldSrc = imgElement.src;
        imgElement.src = `./assets/images/${newImage}`;
        console.log(`✅ 測試更新成功! Element: #${imgElementId}`);
        console.log(`🔄 舊圖片: ${oldSrc}`);
        console.log(`🆕 新圖片: ${imgElement.src}`);
        return true;
    } else {
        console.error(`❌ 找不到圖片元素: #${imgElementId}`);
        return false;
    }
};

// 🧪 快速測試不同圖片
window.testProto1 = () => testWebSocketUpdate("1", "prototype1.png");
window.testProto2 = () => testWebSocketUpdate("1", "prototype2.png");
window.testProto3 = () => testWebSocketUpdate("1", "prototype3.png");
window.testProto4 = () => testWebSocketUpdate("1", "prototype4.png");

// 🔍 WebSocket狀態檢查
window.checkWebSocketStatus = () => {
    if (!window.odoraiApp) {
        console.error('❌ ÔDÔRAI app 未初始化');
        alert('❌ ÔDÔRAI app 未初始化');
        return;
    }
    
    const ws = window.odoraiApp.ws;
    if (!ws) {
        console.error('❌ WebSocket 未初始化');
        window.odoraiApp.showConnectionStatus('❌ WebSocket 未初始化', '#ff0000');
        return;
    }
    
    const states = {
        0: 'CONNECTING (連接中)',
        1: 'OPEN (已連接)',
        2: 'CLOSING (關閉中)',
        3: 'CLOSED (已關閉)'
    };
    
    console.log('🔍 WebSocket 狀態檢查:');
    console.log(`📊 狀態: ${states[ws.readyState]} (${ws.readyState})`);
    console.log(`🌐 URL: ${ws.url}`);
    console.log(`📡 協議: ${ws.protocol}`);
    console.log(`🔗 擴展: ${ws.extensions}`);
    console.log(`🔌 連接狀態: ${window.odoraiApp.wsConnected}`);
    
    const statusColor = ws.readyState === 1 ? '#00ff00' : '#ff0000';
    const message = `WebSocket 狀態: ${states[ws.readyState]}\nURL: ${ws.url}`;
    
    window.odoraiApp.showConnectionStatus(message, statusColor);
};

// Export for testing or external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OdoraiApp, OdoraiUtils };
}





