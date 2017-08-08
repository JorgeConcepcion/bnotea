/* global $ */
$(".save").on("click",function(e){
	e.preventDefault();
	$("#button").attr("value","Started");
	$("#form").get(0).submit(); 
});

$(".submit").on("click",function(e){
	if($(".assistant-input").attr("value")=="" ||  $(".analist-input").attr("value")=="" || $(".caregiver-input").attr("value")==""){
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