/* global $ */
$(".cellNonintensity").on("click", function () {
	if ($(this).text() != "X") {
		let col = $(this).attr("id").split("A")[0];
		let row = $(this).attr("id").split("A")[1];
		let query = "#" + col;
		let frequency = Number($("#frequency").text()) + Number(row) - ($(query).attr("value"));
		$("#frequency").text(frequency);
		$(query).attr("value", row);
		for (let i = row; i > 0; i--) {
			query = "#" + col + "A" + i;
			$(query).text("X");
		}
	}
	else {
		let col = $(this).attr("id").split("A")[0];
		let row = $(this).attr("id").split("A")[1];
		let query = "#" + col;
		let frequency = Number($("#frequency").text()) + Number(row) - ($(query).attr("value")) - 1;
		$("#frequency").text(frequency);
		$(query).attr("value", row - 1);
		for (let i = row; i <= 20; i++) {
			let query = "#" + col + "A" + i;
			$(query).text("");
		}
	}

});

$(".cellIntensityFrequency").on("click", function () {
	let query;
	if ($(this).text() != "X") {
		let col = $(this).attr("id").split("F")[0];
		let row = $(this).attr("id").split("F")[1];
		query = "#" + col;
		let currentDayFrequency = Number($(query).attr("value"));
		let frequency = Number($("#frequency").text()) + Number(row) - ($(query).attr("value"));
		$("#frequency").text(frequency);
		$(query).attr("value", row);
		for (let i = row; i > currentDayFrequency; i--) {
			query = "#" + col + "F" + i;
			$(query).text("X");
			query = "#" + col + "I" + i;
			$(query).text("1");
			query = "#" + col + "N" + i;
			$(query).attr("value", 1);
		}
	}
	else {
		let col = $(this).attr("id").split("F")[0];
		let row = $(this).attr("id").split("F")[1];
		let query = "#" + col;
		let frequency = Number($("#frequency").text()) + Number(row) - ($(query).attr("value")) - 1;
		$("#frequency").text(frequency);
		$(query).attr("value", row - 1);
		for (let i = row; i <= 20; i++) {
			let query = "#" + col + "F" + i;
			$(query).text("");
			query = "#" + col + "I" + i;
			$(query).text("");
			query = "#" + col + "N" + i;
			$(query).attr("value", "");
		}
	}

});

$(".cellIntensity").on("click", function () {
	let intensity = Number($(this).text());
	if (intensity == 4) {
		intensity = 1;
	}
	else if (intensity == 1 || intensity == 2 || intensity == 3) {
		intensity++;
	}
	if (intensity == 1 || intensity == 2 || intensity == 3 || intensity == 4) {
		$(this).text(intensity);
		let col = $(this).attr("id").split("I")[0];
		let row = $(this).attr("id").split("I")[1];
		let query = "#" + col + "N" + row;
		$(query).attr("value", intensity);
	}
});



$(".submit").on("click", function (e) {
	let frequency = Number($("#frequency").text());
	let baseline = Number($("#baseline").text());
	if ($("#1").attr("value") == "" || $("#2").attr("value") == "" || $("#3").attr("value") == "" || $("#4").attr("value") == "" || $("#5").attr("value") == "" || $("#6").attr("value") == "" || $("#7").attr("value") == "" || $("#1").attr("value") == 0 || $("#2").attr("value") == 0 || $("#3").attr("value") == 0 || $("#4").attr("value") == 0 || $("#5").attr("value") == 0 || $("#6").attr("value") == 0 || $("#7").attr("value") == 0) {
		e.preventDefault();
		$.alert("All the days must be filled", {
			position: ["center", [-0.42, 0]],
			title: false // title
		});
	}
	else if (frequency - baseline >= 7 || baseline - frequency >= 7) {
		e.preventDefault();
		$.alert("Frequency is too far from the baseline", {
			position: ["center", [-0.42, 0]],
			title: false // title
		});
	}
	else if($(".assistant-input").attr("value")=="" && !($(".assistant-canvas").parent().attr("style").length>0) ||  $(".analist-input").attr("value")=="" && !($(".analist-canvas").parent().attr("style").length>0) || $(".caregiver-input").attr("value")=="" && !($(".caregiver-canvas").parent().attr("style").length>0) ){
		e.preventDefault();
		$.alert("The entire document needs to be signed", {
			position: ["center", [-0.42, 0]],
			title: false // title
		});
	}
	else{
		if($(".analist").length>0){
			$("#button").attr("value", "Completed");
		}
		if($(".assistant").length>0){
			$("#button").attr("value", "On revision");
		}
		if($(".superuser").length>0){
			$("#button").attr("value", "Accepted");
		}
	}
	
	
});
