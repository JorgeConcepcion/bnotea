/* global $ */
$(".save").on("click",function(e){
	e.preventDefault();
	$("#form").get(0).submit(); 
});



//Activating validation on all forms
$.validate({
	modules: "security",
	errorMessagePosition : "top",
	validateOnBlur: false,
	onSuccess:function(){
		if($(".assistant-input").attr("value")=="" && $(".assistant-canvas").parent().attr("style")==undefined ||  $(".analyst-input").attr("value")=="" && $(".analyst-canvas").parent().attr("style")==undefined || $(".caregiver-input").attr("value")=="" && $(".caregiver-canvas").parent().attr("style")==undefined ){
			$.alert("The entire document needs to be signed", {
				position: ["center", [-0.42, 0]],
				title: false // title
			});
			return false;
		}
		else{
			
			if($(".analyst").length>0){
				$("#button").attr("value", "Completed");
			}
			if($(".assistant").length>0){
				$("#button").attr("value", "On revision");
				
			}
			if($(".superuser").length>0){
				$("#button").attr("value", "Accepted");
			}
			return true;
		}
	}
});