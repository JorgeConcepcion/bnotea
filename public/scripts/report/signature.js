/* global $ */
/* global SignaturePad */
if ($(".caregiver-canvas").length > 0) {
   
	let signaturePadCaregiver = new SignaturePad($(".caregiver-canvas").get(0));
	if($(".caregiver-input").attr("value")!=""){
		signaturePadCaregiver.fromDataURL($(".caregiver-input").attr("value"));
		$(".clear-caregiver").attr("disabled", "");
		$(".activate-caregiver").attr("disabled", "");
		$(".save-caregiver").attr("disabled", "");
		signaturePadCaregiver.off();
	}
	signaturePadCaregiver.off();
	$(".activate-caregiver").on("click",function(){
		signaturePadCaregiver.on();
		$(this).attr("disabled", "");
		$(".caregiver-canvas").addClass("active-signature");
	});
     
	$(".clear-caregiver").on("click",function(){
		signaturePadCaregiver.clear();
	});
    
	$(".save-caregiver").on("click",function(){
		if (!signaturePadCaregiver.isEmpty()) {
			$(".clear-caregiver").attr("disabled", "");
			$(".caregiver-input").attr("value", signaturePadCaregiver.toDataURL());
			signaturePadCaregiver.off();
		}
		else {
			$.alert("Caregiver needs to sign first!!!", {
				position: ["center", [-0.42, 0]],
				title: false // title
			});
		}
	});
}    

if ($(".assistant-canvas").length > 0) {
    
	let signaturePadAssistant = new SignaturePad($(".assistant-canvas").get(0));
	if($(".assistant-input").attr("value")!=""){
		signaturePadAssistant.fromDataURL($(".assistant-input").attr("value"));
		$(".clear-assistant").attr("disabled", "");
		$(".activate-assistant").attr("disabled", "");
		$(".save-assistant").attr("disabled", "");
		signaturePadAssistant.off();
	}
	signaturePadAssistant.off();
	$(".activate-assistant").on("click",function(){
		signaturePadAssistant.on();
		$(this).attr("disabled", "");
		$(".assistant-canvas").addClass("active-signature");
	});
     
	$(".clear-assistant").on("click",function(){
		signaturePadAssistant.clear();
	});
    
	$(".save-assistant").on("click",function(){
		if (!signaturePadAssistant.isEmpty()) {
			$(".clear-assistant").attr("disabled", "");
			$(".assistant-input").attr("value", signaturePadAssistant.toDataURL());
			signaturePadAssistant.off();
		}
		else {
			$.alert("Assistant needs to sign first!!!", {
				position: ["center", [-0.42, 0]],
				title: false // title
			});
		}
	});
} 


if ($(".analist-canvas").length > 0) {
    
	let signaturePadAnalist = new SignaturePad($(".analist-canvas").get(0));
	if($(".analist-input").attr("value")!=""){
		signaturePadAnalist.fromDataURL($(".analist-input").attr("value"));
		$(".clear-analist").attr("disabled", "");
		$(".activate-analist").attr("disabled", "");
		$(".save-analist").attr("disabled", "");
		signaturePadAnalist.off();
	}
	signaturePadAnalist.off();
	$(".activate-analist").on("click",function(){
		signaturePadAnalist.on();
		$(this).attr("disabled", "");
		$(".analist-canvas").addClass("active-signature");
	});
     
	$(".clear-analist").on("click",function(){
		signaturePadAnalist.clear();
	});
    
	$(".save-analist").on("click",function(){
		if (!signaturePadAnalist.isEmpty()) {
			$(".clear-analist").attr("disabled", "");
			$(".analist-input").attr("value", signaturePadAnalist.toDataURL());
			signaturePadAnalist.off();
		}
		else {
			$.alert("Analist needs to sign first!!!", {
				position: ["center", [-0.42, 0]],
				title: false // title
			});
		}
	});
} 
