/* global $ */
/* global SignaturePad */
if ($(".caregiver-canvas").length > 0) {
   
	let signaturePadCaregiver = new SignaturePad($(".caregiver-canvas").get(0));
	if($(".caregiver-input").attr("value")!=""){
		signaturePadCaregiver.fromDataURL($(".caregiver-input").attr("value"));
	}
	signaturePadCaregiver.off();
}    

if ($(".assistant-canvas").length > 0) {
    
	let signaturePadAssistant = new SignaturePad($(".assistant-canvas").get(0));
	if($(".assistant-input").attr("value")!=""){
		signaturePadAssistant.fromDataURL($(".assistant-input").attr("value"));
	}
	signaturePadAssistant.off();
} 


if ($(".analyst-canvas").length > 0) {
    
	let signaturePadAnalyst = new SignaturePad($(".analyst-canvas").get(0));
	if($(".analyst-input").attr("value")!=""){
		signaturePadAnalyst.fromDataURL($(".analyst-input").attr("value"));
	}
	signaturePadAnalyst.off();
} 
