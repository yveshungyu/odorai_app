// ÔDÔRAI App.js - Complete Interactive Logic
// ================================================

class OdoraiApp {
    constructor() {
        this.currentMode = 'relax';
        this.currentPage = 'home-page';
        this.devices = {
            diffuser: true,
            lamp: false,
            speaker: false
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
        
        // 初始化氣味系統
        this.scentSystem = null;
        
        this.modes = {
            relax: {
                name: 'RELAX',
                blend: 'Jasmine + Lavender + Frankincense',
                background: 'linear-gradient(135deg, #FF6B95 0%, #FFA726 100%)',
                color: '#FF6B95'
            },
            focus: {
                name: 'FOCUS',
                blend: 'Peppermint + Rosemary + Eucalyptus',
                background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
                color: '#4FACFE'
            },
            energize: {
                name: 'ENERGIZE',
                blend: 'Citrus + Ginger + Lemongrass',
                background: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
                color: '#43E97B'
            }
        };
        
        this.stats = {
            alarm: 'AM 07:03',
            sleep: {
                time: '8hr 48m',
                change: '+2.2%',
                positive: false
            },
            focus: {
                time: '1hr 03m',
                change: '+5.8%',
                positive: true
            }
        };
        
        this.init();
        this.loadPositionsFromStorage();
    }
    
    init() {
        console.log('Initializing ÔDÔRAI app components...');
        // this.updateTime(); // REMOVED: This function caused a crash
        this.setupEventListeners();
        this.updateUI();
        this.startAutoTrigger();
        
        // 延遲氣味系統初始化直到位置恢復完成
        this.delayedInitScentSystem();
        
        // REMOVED: The related function was deleted
        // setInterval(() => this.updateTime(), 1000); 
        
        // Simulate data updates every 30 seconds
        setInterval(() => this.updateStats(), 30000);
        
        console.log('ÔDÔRAI app fully initialized');
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
        document.getElementById('home-mode-title').addEventListener('click', () => {
            this.cycleModes();
        });
        
        // Mode-page swipe for mode switching only
        this.setupModePageSwipe();
        
        // Add device button
        document.querySelector('.add-device-btn').addEventListener('click', () => {
            this.showAddDeviceDialog();
        });
        
        // Touch gestures for mobile
        this.setupTouchGestures();
        
        // Add resize listener to keep scent points in sync
        window.addEventListener('resize', () => this.syncScentDevicePositions());
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
        const modePage = document.getElementById('mode-page');
        if (!modePage) return;
        let startX = null;
        let startY = null;
        modePage.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        modePage.addEventListener('touchend', (e) => {
            if (startX === null) return;
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            // 只偵測水平滑動且距離夠大
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.animateModeSwitch('next');
                } else {
                    this.animateModeSwitch('prev');
                }
            }
            startX = null;
            startY = null;
        });
    }

    animateModeSwitch(direction) {
        const modeCircle = document.querySelector('.mode-circle');
        if (!modeCircle) return;
        // 決定動畫 class
        const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
        const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';
        // 先加上 outClass
        modeCircle.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');
        modeCircle.classList.add(outClass);
        // 切換 mode
        setTimeout(() => {
            // 切換 mode index
            const modeKeys = Object.keys(this.modes);
            const currentIndex = modeKeys.indexOf(this.currentMode);
            let newIndex;
            if (direction === 'next') {
                newIndex = (currentIndex + 1) % modeKeys.length;
            } else {
                newIndex = (currentIndex - 1 + modeKeys.length) % modeKeys.length;
            }
            this.currentMode = modeKeys[newIndex];
            this.updateUI();
            // 先移除 outClass，馬上加 inClass
            modeCircle.classList.remove('slide-out-left', 'slide-out-right');
            modeCircle.classList.add(inClass);
            // 移除 inClass
            setTimeout(() => {
                modeCircle.classList.remove('slide-in-left', 'slide-in-right');
            }, 400);
        }, 400);
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
                if (!this.devicePositions[this.currentMode]) {
                    this.devicePositions[this.currentMode] = {};
                }
                
                // Convert right positioning to left if needed
                const rect = device.getBoundingClientRect();
                const container = device.parentElement.getBoundingClientRect();
                
                if (left) {
                    this.devicePositions[this.currentMode][deviceType] = {
                        bottom: bottom,
                        left: left
                    };
                } else {
                    const rightValue = container.width - rect.right + container.left;
                    this.devicePositions[this.currentMode][deviceType] = {
                        bottom: bottom,
                        right: `${rightValue}px`
                    };
                }
                
                console.log(`✅ ${deviceType} 位置已保存: left: ${left}, bottom: ${bottom}`);
                console.log(`CSS 設定: .${this.currentMode}-mode .device-icon.${deviceType} { bottom: ${bottom}; left: ${left}; }`);
                
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
        const modeKeys = Object.keys(this.modes);
        const currentIndex = modeKeys.indexOf(this.currentMode);
        const nextIndex = (currentIndex + 1) % modeKeys.length;
        this.currentMode = modeKeys[nextIndex];
        this.updateUI();
        this.triggerModeAnimation();
    }
    
    updateUI() {
        const mode = this.modes[this.currentMode];
        
        // Update home page
        const homePage = document.querySelector('.home-page');
        const modeTitle = document.getElementById('home-mode-title');
        const modeName = document.getElementById('mode-name');
        const scentBlend = document.getElementById('scent-blend');
        
        if (homePage) {
            // This line was incorrectly making the home page active during any mode change.
            // It has been removed to fix the page switching bug.
            // homePage.className = 'page home-page active';
            console.log(`UI updated for mode: ${this.currentMode}`);
        }
        
        if (modeTitle) modeTitle.textContent = mode.name;
        if (modeName) modeName.textContent = mode.name;
        if (scentBlend) scentBlend.textContent = mode.blend;
        
        // Update mode circle color
        const modeCircle = document.querySelector('.mode-circle');
        if (modeCircle) {
            modeCircle.style.background = `linear-gradient(135deg, ${mode.color} 0%, ${mode.color}CC 100%)`;
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

        const triggerTime = document.getElementById('trigger-time');
        if (triggerTime) {
            triggerTime.textContent = `${timeString} Trigger`;
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
                <span class="change-indicator ${this.stats.sleep.positive ? 'positive' : ''}">${this.stats.sleep.change}</span>
                <span class="time-value">${this.stats.sleep.time}</span>
            `;
        }
        
        if (focusElement) {
            focusElement.innerHTML = `
                <span class="change-indicator ${this.stats.focus.positive ? 'positive' : ''}">${this.stats.focus.change}</span>
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
        const page = document.getElementById(pageId);
        if (page) {
            page.style.transform = 'translateX(20px)';
            page.style.opacity = '0';
            
            setTimeout(() => {
                page.style.transform = 'translateX(0)';
                page.style.opacity = '1';
            }, 100);
        }
    }
    
    updateSpatialView() {
        const diffuserDevice = document.querySelector('.diffuser-device');
        const scentZones = document.querySelectorAll('.scent-zone');
        
        if (this.devices.diffuser) {
            if (diffuserDevice) {
                diffuserDevice.classList.add('active');
            }
            scentZones.forEach(zone => {
                zone.style.display = 'block';
            });
        } else {
            if (diffuserDevice) {
                diffuserDevice.classList.remove('active');
            }
            scentZones.forEach(zone => {
                zone.style.display = 'none';
            });
        }
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

// Export for testing or external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OdoraiApp, OdoraiUtils };
}