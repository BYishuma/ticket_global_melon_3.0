import { delete_value, get_stored_value, store_value } from "../module/storage.js";

let loadAutoBooking = async () => {
    let autoBooking = await get_stored_value("autoBooking");
    let test = await get_stored_value("209206");
    console.log(test);
    if (!autoBooking || autoBooking.length < 1) {
        return (document.getElementById("list-booking").innerHTML =
            "暂无预订信息");
    }

    let listContainer = document.getElementById("list-booking");

    autoBooking.forEach((booking, index) => {
        let concertItem = createConcertItem(booking, index);
        listContainer.appendChild(concertItem);
    });
};

function createConcertItem(booking, index) {
    let div = document.createElement("div");
    div.classList.add("booking-item");
    div.setAttribute("data-index", index);

    let deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerHTML = "&#10006;"; // Cross symbol
    deleteButton.addEventListener("click", async(event) => {
        event.stopPropagation(); // Prevent the click event from propagating
        let dataIndex = event.currentTarget.parentNode.getAttribute("data-index");
        await deleteConcertItem(dataIndex);
    });

    let concertInfo = document.createElement("div");
    concertInfo.classList.add("concert-info");
	
    let concertName = document.createElement("p");
    concertName.classList.add("concert-name");
    concertName.textContent = booking["concert-name"] || "";

    let concertId = document.createElement("p");
    concertId.textContent = `演唱会ID：  ${booking["concert-id"] || ""}`;

	let ticketCount = document.createElement("p");
	ticketCount.textContent = `购票数量：  ${booking["ticket"] || ""}`;  
		
	let date = document.createElement("p");
    date.textContent = `日期：  ${booking.date || ""}`;

    let time = document.createElement("p");
    time.textContent = `开演时间（KST）：  ${booking.time || ""}`;

    let section = document.createElement("p");
    section.textContent = `拟选区域：  ${Array.isArray(booking.section) ? booking.section.join(", ") : ""}`;

	// 添加延迟设置显示
	let delaySetting = document.createElement("p");
	delaySetting.textContent = `补充延迟设置：  ${booking.delaySetting?.fixedDelay || 0}ms`;
	delaySetting.style.color = "#666"; // 使用较浅的颜色区分
	delaySetting.style.fontSize = "0.9em"; // 稍小的字体
	
    concertInfo.appendChild(concertName);
    concertInfo.appendChild(concertId);
	concertInfo.appendChild(ticketCount);
    concertInfo.appendChild(date);
    concertInfo.appendChild(time);
    concertInfo.appendChild(section);
	concertInfo.appendChild(delaySetting);
	
    div.appendChild(concertInfo);
    div.appendChild(deleteButton);

    div.addEventListener("click", () => {
        openBookingUrl(booking.platform, booking["concert-id"]);
    });

    return div;
}

function openBookingUrl(platform, concertId) {
    let url;
    switch (platform) {
        case "melon":
            url = `https://tkglobal.melon.com/performance/index.htm?langCd=EN&prodId=${concertId}`;
            break;    
        default:
            console.error("Unknown platform");
            return;
    }
    
    window.open(url, "_blank");
}

async function deleteConcertItem(index) {
    let listContainer = document.getElementById("list-booking");
    let autoBooking = await get_stored_value("autoBooking");
    delete_value(autoBooking[index]["concert-id"]);
    // Remove the item from the array
    autoBooking.splice(index, 1);

    // Update the stored values
    store_value("autoBooking", autoBooking);

    // Remove the corresponding DOM element
    let deletedElement = listContainer.children[index];
    listContainer.removeChild(deletedElement);

    // Update indices of remaining DOM elements
    for (let i = index; i < listContainer.children.length; i++) {
        // Update data-index attribute if needed
        listContainer.children[i].dataset.index = i;
    }
}

loadAutoBooking();
