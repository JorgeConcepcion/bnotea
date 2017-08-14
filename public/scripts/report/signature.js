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


if ($(".analyst-canvas").length > 0) {
    
	let signaturePadAnalyst = new SignaturePad($(".analyst-canvas").get(0));
	if($(".analyst-input").attr("value")!=""){
		signaturePadAnalyst.fromDataURL($(".analyst-input").attr("value"));
		$(".clear-analyst").attr("disabled", "");
		$(".activate-analyst").attr("disabled", "");
		$(".save-analyst").attr("disabled", "");
		signaturePadAnalyst.off();
	}
	signaturePadAnalyst.off();
	$(".activate-analyst").on("click",function(){
		signaturePadAnalyst.on();
		$(this).attr("disabled", "");
		$(".analyst-canvas").addClass("active-signature");
	});
     
	$(".clear-analyst").on("click",function(){
		signaturePadAnalyst.clear();
	});
    
	$(".save-analyst").on("click",function(){
		if (!signaturePadAnalyst.isEmpty()) {
			$(".clear-analyst").attr("disabled", "");
			$(".analyst-input").attr("value", signaturePadAnalyst.toDataURL());
			signaturePadAnalyst.off();
		}
		else {
			$.alert("Analyst needs to sign first!!!", {
				position: ["center", [-0.42, 0]],
				title: false // title
			});
		}
	});
} 
