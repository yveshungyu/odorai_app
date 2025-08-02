// ÔDÔRAI App.js - Complete Interactive Logic
// ================================================

class OdoraiApp {
    constructor() {
        this.currentMode = 'relax';
        this.currentPage = 'home-page';
        this.currentRoom = 'living'; // 新增: 當前房間狀態
        this.devices = {
            diffuser: true,
            lamp: false,
            speaker: false
        };
        
        // 房間配置
        this.rooms = {
            living: { name: 'Living Room', icon: '🏠', background: 'LivingRoom-bg.png' },
            master: { name: 'Master Bedroom', icon: '🛏️', background: 'MasterBedroom-bg.png' },
            second: { name: 'Second Bedroom', icon: '🛌', background: 'SecondBedroom-bg.png' }
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
        console.log('Initializing ÔDÔRAI app...');
        
        this.setupEventListeners();
        this.updateUI();
        this.initScentSystem();
        
        // 初始化時間顯示
        this.updateTriggerTime();
        
        // 每3分鐘更新一次時間 (180000 ms)
        setInterval(() => this.updateTriggerTime(), 180000);
        
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
        
        // Mode info modal
        this.setupModeInfoModal();
        
        // Mode-page swipe for mode switching only
        this.setupModePageSwipe();
        
        // Spatial-page swipe for room switching
        this.setupSpatialPageSwipe();
        
        // Add device button
        document.querySelector('.add-device-btn').addEventListener('click', () => {
            this.showAddDeviceDialog();
        });
        
        // Touch gestures for mobile - 移除頁面間滑動，只保留頁面內滑動
        // this.setupTouchGestures();
        
        // Add resize listener to keep scent points in sync
        window.addEventListener('resize', () => this.syncScentDevicePositions());
        
        // Spatial page interactions
        this.setupSpatialPageInteractions();
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
        const wrapper = document.querySelector('.mode-circle-wrapper');
        const oldCircle = wrapper.querySelector('.mode-circle');
        if (!oldCircle) return;
        // 計算新 mode
        const modeKeys = Object.keys(this.modes);
        const currentIndex = modeKeys.indexOf(this.currentMode);
        let newIndex;
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % modeKeys.length;
        } else {
            newIndex = (currentIndex - 1 + modeKeys.length) % modeKeys.length;
        }
        const newMode = modeKeys[newIndex];
        
        // dots 動畫
        const modeDots = document.querySelector('.mode-dots');
        if (modeDots) {
            const dots = Array.from(modeDots.children);
            dots.forEach(dot => dot.classList.remove('middle'));
            dots[newIndex].classList.add('middle'); // 根據新模式設置正確的點
            
            // 導航點滑動動畫
            modeDots.classList.remove('slide-left', 'slide-right');
            modeDots.classList.add(direction === 'next' ? 'slide-left' : 'slide-right');
        }
        // 建立新圓形
        const newCircle = document.createElement('div');
        newCircle.className = 'mode-circle ' + (direction === 'next' ? 'slide-in-right' : 'slide-in-left');
        // 設定新圓形純色
        const modeColors = {
            relax: '#FF6B95',
            focus: '#4FACFE',
            energize: '#43E97B'
        };
        newCircle.style.backgroundColor = modeColors[newMode];
        newCircle.style.backgroundImage = '';
        // 插入新圓形
        wrapper.appendChild(newCircle);
        // 舊圓形加滑出動畫
        oldCircle.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');
        oldCircle.classList.add(direction === 'next' ? 'slide-out-left' : 'slide-out-right');
        // 動畫結束後，切換 mode、移除舊圓形、移除新圓形動畫 class
        setTimeout(() => {
            this.currentMode = newMode;
            // dots 結構在動畫結束後才重設
            this.updateUI();
            wrapper.removeChild(oldCircle);
            newCircle.classList.remove('slide-in-left', 'slide-in-right');
            if (modeDots) {
                modeDots.classList.remove('slide-left', 'slide-right');
            }
        }, 400);
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
        
        // 更新房間標籤
        const roomLabel = document.querySelector('.room-label span');
        const roomIcon = document.querySelector('.room-icon');
        if (roomLabel) roomLabel.textContent = room.name;
        if (roomIcon) roomIcon.textContent = room.icon;
        
        // 更新背景圖片
        const roomBackground = document.querySelector('.room-background');
        if (roomBackground) {
            roomBackground.style.backgroundImage = `url('./assets/images/${room.background}')`;
        }
        
        // 更新房間導航點
        const roomDots = document.querySelector('.room-dots');
        if (roomDots) {
            const roomKeys = Object.keys(this.rooms);
            const currentIndex = roomKeys.indexOf(this.currentRoom);
            const dots = Array.from(roomDots.children);
            dots.forEach((dot, index) => {
                dot.classList.toggle('middle', index === currentIndex);
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
    
    setupSpatialPageInteractions() {
        // Initialize room UI
        this.updateRoomUI();
        
        // Room device interactions
        document.addEventListener('click', (e) => {
            const roomDevice = e.target.closest('.room-device');
            if (roomDevice) {
                const deviceType = roomDevice.dataset.device;
                if (deviceType) {
                    this.toggleDevice(deviceType);
                    this.showSpatialDeviceAnimation(roomDevice);
                }
            }
        });
        
        // Add point interactions
        document.addEventListener('click', (e) => {
            const addPoint = e.target.closest('.add-point');
            if (addPoint) {
                this.showAddDeviceAtPoint(addPoint);
            }
        });
        
        // Info icon in spatial header
        document.addEventListener('click', (e) => {
            if (e.target.closest('.spatial-header .info-icon')) {
                this.showSpatialInfo();
            }
        });
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
        const infoDialog = document.createElement('div');
        infoDialog.className = 'spatial-info-dialog';
        infoDialog.style.cssText = `
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
            max-width: 320px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        `;
        
        infoDialog.innerHTML = `
            <h3 style="margin-bottom: 15px; color: #333; font-size: 18px;">🏠 Living Room Setup</h3>
            <div style="text-align: left; margin-bottom: 20px; color: #666; font-size: 14px; line-height: 1.6;">
                <p><strong>Active Devices:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>💜 Lavender Diffuser (Relaxation)</li>
                    <li>🍊 Citrus Speaker (Energy)</li>
                    <li>🌿 Eucalyptus Lamp (Focus)</li>
                </ul>
                <p><strong>Current Mode:</strong> ${this.modes[this.currentMode].name}</p>
                <p><strong>Room Size:</strong> 24m² / 258ft²</p>
            </div>
            <button onclick="this.closest('.spatial-info-dialog').remove()" style="
                background: linear-gradient(135deg, #FF6B95 0%, #FFA726 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                font-size: 14px;
            ">Got it</button>
        `;
        
        document.body.appendChild(infoDialog);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (infoDialog.parentElement) {
                infoDialog.remove();
            }
        }, 10000);
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

    setupModeInfoModal() {
        // Mode page info icon click
        const modePageInfoIcon = document.querySelector('.mode-page .info-icon');
        if (modePageInfoIcon) {
            modePageInfoIcon.addEventListener('click', () => {
                this.showModeInfo();
            });
        }

        // Modal close events
        const modal = document.getElementById('mode-info-modal');
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');

        closeBtn.addEventListener('click', () => this.closeModeInfo());
        backdrop.addEventListener('click', () => this.closeModeInfo());
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeModeInfo();
            }
        });
    }

    showModeInfo() {
        const modal = document.getElementById('mode-info-modal');
        this.updateModeInfoContent();
        modal.classList.add('show');
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }

    closeModeInfo() {
        const modal = document.getElementById('mode-info-modal');
        modal.classList.remove('show');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    updateModeInfoContent() {
        const modeData = this.getModeData(this.currentMode);
        
        // Update title
        document.getElementById('modal-formula-name').textContent = modeData.title;
        
        // Update adjustments
        const adjustmentsList = document.getElementById('modal-adjustments');
        adjustmentsList.innerHTML = modeData.adjustments.map(adj => `
            <div class="adjustment-item">
                <span class="adjustment-type">${adj.type}</span>
                <div class="adjustment-content">
                    <div>
                        <span class="ingredient-name">${adj.ingredient}</span>
                        <span class="percentage-change">${adj.change}</span>
                    </div>
                    <div class="adjustment-reason">${adj.reason}</div>
                </div>
            </div>
        `).join('');
        
        // Update core scents
        const coreScents = document.getElementById('modal-core-scents');
        coreScents.innerHTML = modeData.coreScents.map(scent => `
            <div class="scent-item">
                <span class="scent-name">${scent.name}</span>
                <span class="scent-effect">${scent.effect}</span>
            </div>
        `).join('');
        
        // Update AI summary
        document.getElementById('modal-ai-summary').innerHTML = `<p style="margin: 0;">${modeData.aiSummary}</p>`;
        
        // Update benefits
        const benefits = document.getElementById('modal-benefits');
        benefits.innerHTML = modeData.benefits.map(benefit => `
            <div class="benefit-item">
                <div class="benefit-label">${benefit.label}</div>
                <div class="benefit-value">${benefit.value}</div>
            </div>
        `).join('');
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