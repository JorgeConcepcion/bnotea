/*global $*/
$("#start-date").on("changed.bs.select",function(){
	var date=Date.parse($(this).val());
	$("#end-date").text(date.add({days:6}).toString("MM/dd/yyyy"));
	date.add({days:-7});
	$(".day").each(function(){
		$(this).text(date.add({days:1}).toString("MM/dd/yyyy"));
		$(this).parent().find(".date-hidden").val($(this).text());
	});
	$("input[type='checkbox'").removeAttr("disabled");
	$("#startDate").val($(this).val());
	$("#endDate").val($("#end-date").text());
});

$("input[type='checkbox']").change(function() {
	var $checkbox = $(this);
	if ($checkbox.prop("checked")) {
		$(this).parent().siblings(".time").children().children(".timeIn").removeAttr("disabled");
	}
	else{
		$(this).parent().siblings(".time").children().children(".timeIn").attr("disabled","");
		$(this).parent().siblings(".time").children().children(".timeIn").val("");
		$(this).parent().siblings(".time").children().children(".timeOut").attr("disabled","");
		$(this).parent().siblings(".time").children().children(".timeOut").val("");
	} 
});

$(".timepickerIn").timepicki({
	show_meridian:false,
	min_hour_value:7,
	max_hour_value:22,
	step_size_minutes:1,
	overflow_minutes:true,
	increase_direction:"up",
	disable_keyboard_mobile: true,
	on_change:change,
	start_time:[7,0],
});
$(".timepickerOut").timepicki({
	show_meridian:false,
	min_hour_value:7,
	max_hour_value:22,
	step_size_minutes:15,
	overflow_minutes:true,
	increase_direction:"up",
	disable_keyboard_mobile: true,
	on_change:change,
	start_time:[7,0],
});

function change(ele) {
	var element=$(ele).parent().parent().siblings("td.time").children().children("input");
	if($(ele).hasClass("timeIn")){
		$(element).removeAttr("disabled");
		let temp=$(ele).val().split(":");
		if(temp[1]>=45){
			temp[1]=Number(temp[1])+15-60;
			temp[0]=Number(temp[0])+1;
		}
		else{
			temp[1]=Number(temp[1])+15;
		}
		$(element).val(temp[0]+":"+temp[1]);
		$(element).attr("data-timepicki-mini",temp[1]);
		$(element).attr("data-timepicki-tim",temp[0]);
	}
	else{
		let ele_tim=Number($(ele).attr("data-timepicki-tim"));
		let element_tim=Number($(element).attr("data-timepicki-tim"));
		let ele_mini=Number($(ele).attr("data-timepicki-mini"));
		let element_mini=Number($(element).attr("data-timepicki-mini"));
		if(isNaN(element_tim)){
			element_tim=$(element).val().split(":")[0];
			element_mini=$(element).val().split(":")[1];
		}
		let units=((ele_tim-element_tim)*4)+((ele_mini-element_mini)/15);
		if(ele_tim<element_tim || (ele_mini==element_mini && ele_tim<=element_mini) || (units>32)){
			let t=$(element).val().split(":");
			t[1]=Number(t[1])+15;
			$(ele).attr("data-timepicki-mini",t[1]);
			$(ele).attr("data-timepicki-tim",t[0]);
			$(ele).val(t[0]+":"+t[1]);
			$(ele).siblings("div").fadeOut();

		}
		
        
	}
    
}


