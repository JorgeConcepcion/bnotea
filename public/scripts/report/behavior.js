/* global $ */
$(".save").on("click",function(e){
	e.preventDefault();
	$("#form").get(0).submit(); 
});

$(".cellNonintensity").on("click", function () {
	if ($(this).text() != "X") {
		let col = $(this).attr("id").split("A")[0];
		let row = $(this).attr("id").split("A")[1];
		let query = "#" + col;
		let frequency = Number($("#frequency").text()) + Number(row) - ($(query).attr("value"));
		$("#frequency").text(frequency);
		let baseline = Number($("#baseline").text());
		if(frequency - baseline >2 || baseline - frequency >2){
			$("#justification-cont").removeAttr("style");
		}
		else{
			$("#justification-cont").attr("style","display:none");
			$("#justification-input").val("");
		}
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
		let baseline = Number($("#baseline").text());
		if(frequency - baseline >2 || baseline - frequency >2){
			$("#justification-cont").removeAttr("style");
		}
		else{
			$("#justification-cont").attr("style","display:none");
			$("#justification-input").val("");
		}
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
		let baseline = Number($("#baseline").text());
		if(frequency - baseline >2 || baseline - frequency >2){
			$("#justification-cont").removeAttr("style");
		}
		else{
			$("#justification-cont").attr("style","display:none");
			$("#justification-input").val("");
		}
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
		let baseline = Number($("#baseline").text());
		$("#frequency").text(frequency);
		if(frequency - baseline >2 || baseline - frequency >2){
			$("#justification-cont").removeAttr("style");
		}
		else{
			$("#justification-cont").attr("style","display:none");
			$("#justification-input").val("");
		}
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

	if($("#1").attr("value") == "" || $("#2").attr("value") == "" || $("#3").attr("value") == "" || $("#4").attr("value") == "" || $("#5").attr("value") == "" || $("#6").attr("value") == "" || $("#7").attr("value") == "" || $("#1").attr("value") == 0 || $("#2").attr("value") == 0 || $("#3").attr("value") == 0 || $("#4").attr("value") == 0 || $("#5").attr("value") == 0 || $("#6").attr("value") == 0 || $("#7").attr("value") == 0) {
		e.preventDefault();
		$.alert("All the days must be filled", {
			position: ["center", [-0.42, 0]],
			title: false // title
		});
	}
	
	else if($(".assistant-input").attr("value")=="" && $(".assistant-canvas").parent().attr("style")==undefined ||  $(".analyst-input").attr("value")=="" && $(".analyst-canvas").parent().attr("style")==undefined || $(".caregiver-input").attr("value")=="" && $(".caregiver-canvas").parent().attr("style")==undefined ){
		e.preventDefault();
		$.alert("The entire document needs to be signed", {
			position: ["center", [-0.42, 0]],
			title: false // title
		});
	}
	
	
	
});
$.validate({
	modules: "security",
	validateOnBlur: false,
	onSuccess:function(){
		if($(".analyst").length>0){
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