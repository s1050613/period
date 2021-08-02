var cols = ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA", "#FFB5E8", "#85E3FF", "#D5AAFF", "#FFF5BA"];
var borderCols = ["#DD7880", "#DD9590", "#DDB8A0", "#C0D0A9", "#93C8B5", "#A5ACC8", "#DD83C6", "#63A1DD", "#B388DD", "#DDD398"];
var times = ["8:45 - 9:35", "9:35 - 10:25", "10:25 - 10:45", "10:45 - 11:35", "11:35 - 12:25", "12:25 - 1:15", "1:15 - 2:05", "2:05 - 2:55", "2:55 - 3:45"];
var periodList = [{ type: "period", display: "Period 1" }, { type: "period", display: "Period 2" }, { type: "breaktime", display: "Recess" }, { type: "period", display: "Period 3" }, { type: "period", display: "Period 4" }, { type: "period", display: "Period 5" }, { type: "breaktime", display: "Lunchtime" }, { type: "period", display: "Period 7" }, { type: "period", display: "Period 8" }];

var subs, teachers, cols, borderCols, times, timetable;

var days = 5;
var showPeriodList = true;
var showTeachers = true;
var showTimes = false;

var titleEl;

window.onload = () => {
	/*removeCookie("data-exists");
	removeCookie("data");
	removeCookie("subs");
	removeCookie("teachers");
	removeCookie("cols");
	removeCookie("borderCols");
	removeCookie("times");
	removeCookie("timetable");*/
	
	if(getCookie("data-exists")) {
		getCookie("data").split("|").forEach(d => {
			console.log(atob(d));
			eval(atob(d));
		});
	} else {
		var data = prompt("Enter timetable data:");
		atob(data).split("|").forEach(d => {
			eval(d);
		});
		//eval(atob(data));
		
		setCookie("data", data);
		
		setCookie("data-exists", 1);
	}
	
	update();
	
	titleEl = selectEl("#titleEl");
	titleEl.onclick = () => {
		var newTitle = prompt("Enter new name for your timetable:");
		if(!newTitle) {
			return;
		}
		titleEl.innerText = newTitle;
		document.title = `${newTitle} | Period`;
	};
};

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
			${periodList.map((p, i) => "<div class='box" + (p.type == "breaktime"? " break" : "") + "'>" + p.display + (showTimes? ("<br/><span class='small'>" + times[i] + "</span>") : "") + "</div>").join("")}
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
				<div class="box" onclick="showTeachers=!showTeachers;update();">${dayName}</div>
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

function newData() {
	var n = prompt("Enter data:");
	setCookie("data", getCookie("data") + "|" + n);
	eval(atob(n));
	update();
}
