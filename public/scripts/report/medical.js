/* global $ document */
var dates=$("#dates").html();
$(".fa.fa-plus.fa-plus-medical").on("click", function () {
	var index;
	var element = $(".selectpicker.index-medical").last().attr("name");
	if (element == undefined) {
		index = 0;
	}
	else {
		index = Number(element.split("[")[3].split("]")[0]) + 1;
	}
	$(".medical-visit").append(" <div class=\"row medical-visit-row\">" +
								"<div class=\"col-md-3 col-sm-12\">" +
								"<div class=\"form-inline\">" +
								"<label>Doctor: </label>" +
								"<select class=\"selectpicker index-medical\" data-width=\"50%\" name=\"report[medical][medicalVisit][" + index + "][doctor]\" title=\"Doctor\" data-validation=\"required\">" +
								"<option>Pediatrician</option>" +
								"<option>Neurologist</option>" +
								"<option>Psychiatrist</option>" +
								"<option>Other</option>" +
								"</select>" +
								"</div>" +
								"</div>" +
								"<div class=\"col-md-6 col-sm-12\">" +
								"<div class=\"form-inline\">" +
								"<label>Reason: </label>" +
								"<input type=\"text\"class=\"form-control wide\" placeholder=\"Reason\" name=\"report[medical][medicalVisit][" + index + "][reason]\" data-validation=\"required\">" +
								"</div>" +
								"</div>" +
								"<div class=\"col-md-3 col-sm-12\">" +
								"<div class=\"form-inline\">" +
								"<label>Date: </label>" +
								"<select  class=\"selectpicker\" data-width=\"auto\" name=\"report[medical][medicalVisit]["+ index +"][date]\" title=\"Date\" data-validation=\"required\">" +dates+
								" </select>"+
								"<span class=\"trash\"><i class=\"fa fa-trash\" ></i></span>" +
								"</div>" +
								"</div>" +
								"</div>");
	$(".selectpicker").selectpicker("refresh");
});

$(".fa.fa-plus.fa-plus-medication").on("click", function () {
	console.log($(".assistant").length);
	var index;
	var element = $(".selectpicker.index-medication").last().attr("name");
	if (element == undefined) {
		index = 0;
	}
	else {
		index = Number(element.split("[")[3].split("]")[0]) + 1;
	}

	$(".medication-change").append("<div class=\"row medication-row\">" +
								"<div class=\"col-md-6\">" +
								"<div class=\"form-inline\">" +
								"<label>Medication: </label>" +
								"<input type=\"text\"class=\"form-control wide\" placeholder=\"Medication\" name=\"report[medical][medication][" + index + "][name]\" data-validation=\"required\">" +
								"</div>" +
								"</div>" +
								"<div class=\"col-md-6\">" +
								"<div class=\"form-inline\">" +
								"<label>Action: </label>" +
								"<select class=\"selectpicker index-medication\" data-width=\"20%\" name=\"report[medical][medication][" + index + "][action]\" title=\"Action\" data-validation=\"required\">" +
								"<option>Add</option>" +
								"<option>Increase dosage</option>" +
								"<option>Decrease dosage</option>" +
								"</select>" +
								" <span class=\"trash\"><i class=\"fa fa-trash\" ></i></span>" +
								"</div>" +
								"</div>" +
								"</div>");
	$(".selectpicker").selectpicker("refresh");
	
});



$(document).on("click", ".trash", function (event) {
	$(this).parent().parent().parent().fadeOut(500, function () {
		$(this).remove();
	});
	event.stopPropagation();
});
