/* global $ */
$(".save").on("click",function(e){
	e.preventDefault();
	$("#form").get(0).submit(); 
});

$(".submit").on("click",function(e){
	if($(".assistant-input").attr("value")=="" && !($(".assistant-canvas").parent().attr("style").length>0) ||  $(".analist-input").attr("value")=="" && !($(".analist-canvas").parent().attr("style").length>0) || $(".caregiver-input").attr("value")=="" && !($(".caregiver-canvas").parent().attr("style").length>0) ){
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
//Activating validation on all forms
$.validate({
	modules: "security",
	errorMessagePosition : "top",
	validateOnBlur: false
});