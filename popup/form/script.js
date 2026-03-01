import { get_stored_value, store_value } from "../module/storage.js";

window.onclick = function(event) {
    const target = event.target;
    if (target.classList.contains("close")) {
        window.history.back();
    }
}

document.addEventListener('DOMContentLoaded', function  () {
    const form = document.querySelector('form');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        form.getElementsByTagName("button")[0].disabled = true;
        
        let data = {};
        const formData = new FormData(form);
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        data["ticket"] = document.getElementById("ticket").value;
		data["section"] = data["section"].split(",");
        data["platform"] = form.getElementsByTagName("button")[0].id;
		// 固定延迟设置
		data["delaySetting"] = {
            fixedDelay: parseInt(data["fixed-delay"]) || 0
	    };
		
        let array = await get_stored_value("autoBooking") || [];
        store_value(data["concert-id"], data);
        array.push(data);
        store_value("autoBooking", array);
        window.history.back();
    });
});