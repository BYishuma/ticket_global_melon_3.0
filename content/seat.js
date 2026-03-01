//工具函数
async function randomSleep(min, max, randomFactor = 0.3) {
    const baseDelay = min + Math.random() * (max - min);
    const finalDelay = baseDelay * (1 + (Math.random() - 0.5) * randomFactor);
    await new Promise(resolve => setTimeout(resolve, finalDelay));
}

async function adaptiveSleep(baseMin, baseMax, failureCount = 0) {
    const factor = 1 + (failureCount * 0.2); 
    const adjustedMin = baseMin * factor;
    const adjustedMax = baseMax * factor;
    return await randomSleep(adjustedMin, adjustedMax);
}

async function fixedDelay() {
    const delay = window._fixedDelay || 400;
    await new Promise(resolve => setTimeout(resolve, delay));
}

async function randomMouseMovement() {
    const frame = theFrame();
    
    const shouldDoFullMovement = Math.random() > 0.5;
    
    const moveCount = shouldDoFullMovement 
        ? 3 + Math.floor(Math.random() * 2)  
        : 1 + Math.floor(Math.random() * 2); 
    
    for (let i = 0; i < moveCount; i++) {
        const x = Math.random() * frame.innerWidth;
        const y = Math.random() * frame.innerHeight;
        
        const evt = new frame.MouseEvent("mousemove", {
            clientX: x,
            clientY: y,
            bubbles: true
        });
        frame.document.dispatchEvent(evt);
        
        await randomSleep(50, 50 + Math.random() * 100);
    }
}

async function humanLikeInteraction(element) {
    const frame = theFrame();
    const doc = frame.document;
       
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i <= 10; i++) {
        const x = rect.left + (i / 10) * rect.width;
        const y = rect.top + Math.sin(i / 2) * 20;
        
        const evt = new frame.MouseEvent("mousemove", {
            clientX: x,
            clientY: y,
            bubbles: true
        });
        doc.dispatchEvent(evt);
        
        await randomSleep(50, 50 + Math.random() * 100);
    }
    
    await randomSleep(50, 50 + Math.random() * 100);
    element.click();
}

function playBeep(frequency = 440, duration = 500) {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine"; 
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gainNode.gain.setValueAtTime(0.1, context.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
        context.close();
    }, duration); 
}

async function showBrowserNotification(title, message) {
    try {

        if (!("Notification" in window)) {
            console.log("该浏览器不支持桌面通知");
            return;
        }

        if (Notification.permission === "granted") {
            new Notification(title, {
                body: message,
            });
        } else if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                new Notification(title, {
                    body: message,
                });
            }
        }
    } catch (error) {
        console.error('显示浏览器通知时出错:', error);
    }
}

//选座流程
function theFrame() {
    if (window._theFrameInstance == null) {
      window._theFrameInstance = document.getElementById('oneStopFrame').contentWindow;
    }
    return window._theFrameInstance;
}

function getConcertId() {
    return document.getElementById("prodId").value;
}

function openEverySection() {
    let frame = theFrame();
    let section = frame.document.getElementsByClassName("seat_name");
    console.log(section);
    for (let i = 0; i < section.length; i++) {
        section[i].parentElement.click();
    }
}

async function handleAreaMatch(areaName, action = 'find') {
    const frame = theFrame();
    const sections = frame.document.getElementsByClassName("area_tit");
    
    const reg = new RegExp(areaName.trim() + "$", "i");
    
	    for (const section of sections) {
	        if (reg.test(section.textContent.trim())) {
	            const parent = section.parentElement;
	            
	            if (action === 'click') {
	                parent.click();
	                return true;
	            } else {

	                return parent;
	            }
	        }
	    }
	    
	    if (action === 'click') {
	        console.warn("未找到匹配的区域:", areaName);
			return false;
	    }
	    return null;
}

async function findSeat(maxSeats) {
    let frame = theFrame();
    let canvas = frame.document.getElementById("ez_canvas");
    let seats = canvas.querySelectorAll('rect');
    console.log(`Found ${seats.length} seats`);

    const rowLabels = Array.from(canvas.querySelectorAll('text'))
        .filter(t => {
            const text = t.textContent.trim();
            return t.getAttribute('fill') === '#aaaaaa' && /^([A-Za-z]|\d+)$/.test(text);
        })
        .map(t => ({
            y: parseFloat(t.getAttribute('y')),
            rowNum: t.textContent.trim()
        }));

    if (rowLabels.length === 0) {
        console.warn("未检测到排号标签，将按坐标分组");
        rowLabels.push({ y: 0, rowNum: '1' });
    }

    let availableSeats = [];
    for (let seat of seats) {
        const fillColor = seat.getAttribute('fill');
        if (fillColor === '#DDDDDD' || fillColor === 'none') continue;

        const x = parseFloat(seat.getAttribute('x'));
        const y = parseFloat(seat.getAttribute('y'));

        let row = rowLabels.reduce((closest, label) => 
            Math.abs(y - label.y) < Math.abs(y - closest.y) ? label : closest,
        rowLabels[0]);

        if (Math.abs(y - row.y) > 20) row = { rowNum: '未知' };

        availableSeats.push({
            element: seat,
            x, y,
            row: row.rowNum
        });
    }

    //前排优先
    availableSeats.sort((a, b) => {
        if (isNaN(a.row) && isNaN(b.row)) 
            return a.row.localeCompare(b.row);
        return (parseInt(a.row) || 999) - (parseInt(b.row) || 999);
    });

    //多数策略1：连坐优先
    const seatGroups = {};
    availableSeats.forEach(seat => {
        if (!seatGroups[seat.row]) seatGroups[seat.row] = [];
        seatGroups[seat.row].push(seat);
    });

    for (const [row, seatsInRow] of Object.entries(seatGroups)) {
        if (seatsInRow.length < maxSeats) continue;

        seatsInRow.sort((a, b) => a.x - b.x);
        let consecutiveCount = 1;
        for (let i = 1; i < seatsInRow.length; i++) {
            if (Math.abs(seatsInRow[i].x - seatsInRow[i-1].x) < 15) {
                consecutiveCount++;
                if (consecutiveCount >= maxSeats) {
                    const startIdx = i - maxSeats + 1;
                    console.log(`找到${maxSeats}个连座：${row}排`);
                    for (let j = startIdx; j <= i; j++) {
                        await clickSeat(seatsInRow[j].element);
                    }
                    return true;
                }
            } else {
                consecutiveCount = 1;
            }
        }
    }

    // 策略2：同排任意座位
    for (const [row, seatsInRow] of Object.entries(seatGroups)) {
        if (seatsInRow.length >= maxSeats) {
            console.log(`选择${row}排的${maxSeats}个座位`);
            seatsInRow.sort((a, b) => a.x - b.x); // 按x坐标从左到右选
            for (let i = 0; i < maxSeats; i++) {
                await clickSeat(seatsInRow[i].element);
            }
            return true;
        }
    }

    // 策略3：跨排选座
    if (availableSeats.length >= maxSeats) {
        console.log(`跨排选择${maxSeats}个最近的座位`);
        
        availableSeats.sort((a, b) => {
            const rowCompare = isNaN(a.row) && isNaN(b.row) 
                ? a.row.localeCompare(b.row) 
                : (parseInt(a.row) || 999) - (parseInt(b.row) || 999);
            return rowCompare || a.x - b.x;
        });

        for (let i = 0; i < maxSeats; i++) {
            await clickSeat(availableSeats[i].element);
        }
        return true;
    }

    console.log(`没有足够的座位（需要${maxSeats}个，当前可用${availableSeats.length}个）`);
    return false;
}

async function clickSeat(seat) {
    const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
    });
    seat.dispatchEvent(clickEvent);
    playBeep(660,1000);
    await randomSleep(50, 100);
}

async function proceedToNextStep() {
    let frame = theFrame();
	try {
	    const nextBtn = frame.document.getElementById("nextTicketSelection");

		 if (!nextBtn) {
	        console.error("下一步按钮未找到");
	        return false;
	    }
		console.log("下一步按钮已找到");
		
		 if (nextBtn.disabled || nextBtn.offsetParent === null) {
		      console.log("下一步按钮不可用或不可见，等待...");
		      await adaptiveSleep(200, 400);
		      return proceedToNextStep();
		  }
			
        nextBtn.click();
	
	    console.log("已成功进行下一步");
	    playBeep(440, 1000);
		
		await showBrowserNotification("选座成功", "已选中座位");
				
	    return true;
	 } catch (error) {
	    console.error("点击下一步按钮时出错:", error);
	    return false;
	 }
}
async function searchSeat(data) {
    const ticketCount = parseInt(data.ticket) || 1;
    console.log(`Searching for ${ticketCount} tickets`);

    for (const sec of data.section) {
        openEverySection(); 

        const areaElement = await handleAreaMatch(sec);
        if (!areaElement) {
            console.warn(`区域"${sec}"未找到匹配元素`);
            continue;
        }
       
            console.log(`检查 ${sec} 的匹配区域`)
			//添加必要延迟
			await fixedDelay();
			await humanLikeInteraction(areaElement);
			await randomSleep(50, 150);


            if (await findSeat(ticketCount)) {
                await proceedToNextStep();
                return; 
            }
        }
    
    // 所有区域失败后重试
    console.log("Reloading to try again");
    await reload();
    await searchSeat(data);
}

async function reload() {
    let frame = theFrame();
    frame.document.getElementById("btnReloadSchedule").click();
    await adaptiveSleep(200, 400);
	await fixedDelay();
}

async function waitFirstLoad() {
    let concertId = getConcertId();
    let data = await get_stored_value(concertId);
	if (!data) {
	    data = {
	        ticket: 1
	    };
	}
	if (data?.delaySetting?.fixedDelay !== undefined) {
	    window._fixedDelay = data.delaySetting.fixedDelay;
	}
    await randomSleep(600, 900);
	await fixedDelay();
    searchSeat(data);
}

waitFirstLoad();