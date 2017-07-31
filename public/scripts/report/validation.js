/* global $ */
$(".save").on("click",function(e){
	e.preventDefault();
	$("#form").get(0).reset();
	$("#button").attr("value","save");
	$("#form").get(0).submit(function(){}); 
});

$(".submit").on("click",function(e){
	if($(".assistant-input").attr("value")=="" ||  $(".analist-input").attr("value")==""){
		e.preventDefault();
		$.alert("The entire document needs to be signed", {
			position: ["center", [-0.42, 0]],
			title: false // title
		});
	}
});
//Activating validation on all forms
$.validate({
	modules: "security",
	errorMessagePosition : "top",
	validateOnBlur: false
});