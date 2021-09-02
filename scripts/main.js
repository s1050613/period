var cols = ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA", "#FFB5E8", "#85E3FF", "#D5AAFF", "#FFF5BA"];
var borderCols = ["#DD7880", "#DD9590", "#DDB8A0", "#C0D0A9", "#93C8B5", "#A5ACC8", "#DD83C6", "#63A1DD", "#B388DD", "#DDD398"];
var periodList = [{ type: "period", display: "Period 1", time: ["8:40", "9:25"] }, { type: "period", display: "Period 2", time: ["9:30", "10:15"] }, { type: "breaktime", display: "Recess", time: ["10:15", "10:35"] }, { type: "period", display: "Period 3", time: ["10:35", "11:20"] }, { type: "period", display: "Period 4", time: ["11:25", "12:10"] }, { type: "period", display: "Period 5", time: ["12:15", "13:00"] }, { type: "breaktime", display: "Lunchtime", time: ["13:00", "14:00"] }, { type: "period", display: "Period 7", time: ["14:00", "14:45"] }, { type: "period", display: "Period 8", time: ["14:50", "15:35"] }];

var subs, teachers, cols, borderCols, times, timetable;

var days = 5;
var showPeriodList = true;
var showTeachers = true;
var showTimes = false;

var titleEl;
var settingsEl, settingsTab;

window.onload = async() => {
	/*removeCookie("data-exists");
	removeCookie("data");
	removeCookie("title");*/
	
	titleEl = selectEl("#titleEl");
	titleEl.onclick = () => {
		var newTitle = prompt("Enter new name for your timetable:");
		if(!newTitle) {
			return;
		}
		titleEl.innerText = newTitle;
		document.title = `${newTitle} | Period`;
		setCookie("title", newTitle);
	};
	
	if(getCookie("data-exists")) {
		getCookie("data").split("|").forEach(d => {
			console.log(atob(d));
			eval(atob(d));
		});
		var title = getCookie("title");
		titleEl.innerHTML = title;
		document.title = `${title} | Period`;
	} else {
		var { value: data } = await (swal || {
			fire: function(stuffs) {
				return {
					value: prompt(`${stuffs.title}\n\n${stuffs.html}`)
				};
			}
		}).fire({
			title: "Welcome to Period!",
			html: "Period is the ultimate school timetable, designed for the student, by the student.<br/><br/>Start by entering your timetable data:",
			input: "text",
			inputValidator: value => {
				if(!value) {
					return "Please enter something!";
				}
			},
			icon: "success"
		});
		atob(data).split("|").forEach(d => {
			eval(d);
		});
		//eval(atob(data));
		
		setCookie("data", data);
		setCookie("title", "My Timetable");
		
		setCookie("data-exists", 1);
	}
	
	update();
	
	settingsEl = selectEl("#settings");
	settingsTab = selectEl("#settingsTab");
	settingsTab.onclick = () => {
		settingsEl.classList.toggle("open");
	};
	
	askForNotifications();
	
	setTimeout(function() {
		sendNotification("(IGNORE--TEST NOTIFICATION) English in 5 minutes!", {
			body: "In 5 minutes, you will have English!",
			icon: "uploads/clock.jpg",
			tag: "reminder",
			actions: [
				{
					action: "zoom_join",
					title: "Join Zoom",
					icon: "uploads/zoom.jpg"
				}
			]
		});
	}, 5000);
	
	loop();
};

function loop() {
	//update();
	
	var currentPeriod = -1;
	periodList.forEach((p, i) => {
		//if(getSeconds() >= sfd(p.time[0]) && getSeconds() < sfd(p.time[1])) {
			currentPeriod = i;
		//}
	});
	//if()
	
	window.requestAnimationFrame(loop);
}

function resetTimetableElement() {
	// The main HTML bit
	/*var periodList = `
		<div class="column period-list">
			<div class="box invisible">HABST DU EINEN KUCHEN?!</div>
			<div class="box">Period 1</div>
			<div class="box">Period 2</div>
			<div class="box break">Recess</div>
			<div class="box">Period 3</div>
			<div class="box">Period 4</div>
			<div class="box">Period 5</div>
			<div class="box break">Lunchtime</div>
			<div class="box">Period 7</div>
			<div class="box">Period 8</div>
		</div>
	`;*/
	var periodListHTML = `
		<div class="column period-list">
			<div class="box invisible">HABST DU EINEN KUCHEN?!</div>
			${periodList.map((p, i) => "<div class='box" + (p.type == "breaktime"? " break" : "") + ((getDay() >= 0 && getDay() <= 5 && getSeconds() >= sfd(p.time[0]) && getSeconds() < sfd(p.time[1]))? " current" : "") + "'>" + p.display + (showTimes? ("<br/><span class='small'>" + p.time[0] + " - " + p.time[1] + "</span>") : "") + "</div>").join("")}
		</div>
	`;
	var aDay = `
		<div class="box"></div>
		<div class="box"></div>
		<div class="box break">Recess</div>
		<div class="box"></div>
		<div class="box"></div>
		<div class="box"></div>
		<div class="box break">Lunchtime</div>
		<div class="box"></div>
		<div class="box"></div>
	`;
	var timetableEl = selectEl(".timetable");
	timetableEl.innerHTML = showPeriodList? periodListHTML : "";
	for(var day = 0; day < days; day++) {
		var dayName = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][day % 5];
		if(days > 5) {
			dayName += ` ${~~(day / 5) + 1}`;
		}
		timetableEl.innerHTML += `
			<div class="column">
				<div class="box${day == getDay()? " current" : ""}" onclick="showTeachers=!showTeachers;update();">${dayName}</div>
				${aDay}
			</div>
		`;
	}
	// Now the styling
	timetableEl.style.gridTemplateColumns = `${["", "1fr "][+showPeriodList]}repeat(${days}, minmax(0, 2fr))`;
	// Adding events
	selectEls(".column:not(.period-list)").forEach(column => {
		column.querySelectorAll(".box:not(:first-child):not(.break)").forEach(box => {
			box.onclick = function() {
				var newP = prompt(`Enter new period:\n\nOptions;\n${subs.map((s, i) => i + ": " + s).join("\n")}`);
				if(!newP) {
					return;
				}
				timetable[this.dataset.day][this.dataset.period] = newP;
				setCookie("timetable", timetable);
				update();
			};
		});
	});
}
function renderTimetable() {
	selectEls(".column:not(.period-list)").forEach((column, day) => {
		var lastSub = -1;
		var period = 0;
		var boxes = column.querySelectorAll(".box:not(:first-child)");
		var periods = column.querySelectorAll(".box:not(:first-child):not(.break)");
		boxes.forEach((box, i) => {
			if(box.classList.contains("break")) {
				return;
			}
			if(i && boxes[i - 1].classList.contains("break")) {
				lastSub = -1;
			}
			var sub = timetable[day][period];
			box.innerText = subs[sub];
			if(showTeachers) {
				box.innerHTML = `<b>${subs[sub]}</b><br/>${teachers[sub]}`;
				//box.innerText += `\n${teachers[sub]}`;
			}
			box.style.background = cols[sub];
			box.style.border = `3px solid ${borderCols[sub]}`;
			if(sub == lastSub) {
				var i = period - 1;
				var newBox;
				while(i >= 0) {
					newBox = periods[i];
					if(!newBox.dataset.toDie) {
						break;
					}
					i--;
				}
				periods[i].dataset.span = 1 + period - i;
				box.dataset.toDie = true;
				column.removeChild(box);
			}
			box.dataset.day = day;
			box.dataset.period = period;
			lastSub = sub;
			period++;
		});
	});
}
function update() {
	resetTimetableElement();
	renderTimetable();
}

function getDay() {
	return (new Date()).getDay() - 1;
}
function getSeconds() {
	var d = new Date();
	return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}
function sfd(d) {
	var a = d.split(":");
	return a[0] * 3600 + a[1] * 60;
}
function newData() {
	var n = prompt("Enter data:");
	if(!n) {
		return;
	}
	setCookie("data", getCookie("data") + "|" + n);
	eval(atob(n));
	update();
}

function askForNotifications() {
	if(window.Notification) {
		Notification.requestPermission().then(res => {
			alert(["Notifications have been blocked!", "Notifications have been allowed!"][+(res == "granted")]);
		});
	}
}
function sendNotification(title, data) {
	if(window.Notification && Notification.permission == "granted") {
		var note = new Notification(title, data);
	}
}
