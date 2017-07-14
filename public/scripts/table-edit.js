
$(".fa-plus-behavior").on("click",function(){
	$('#behavior-add').fadeToggle();
})

$('#behavior-add').on("keypress",function(event){
	if(event.which===13){
		var index=0;
		var element=$("#behavior-table .behavior-table-row:last-child input").attr("name");
		if(element!=undefined){
			index=Number(element.split("[")[2].split("]")[0])+1;	
		}
		
		$("#behavior-table").append('<tr class="behavior-table-row"></tr>')
		$("#behavior-table tr:last-child").append('<th scope="row"><input class="table-input" value="'+$(".behavior-name").val()+'"name="client[maladaptativeBehaviors]['+index+'][name]" type="text"></th>');
		$("#behavior-table tr:last-child").append('<td><span><input class="table-input" value="'+$(".behavior-baseline").val()+'"name="client[maladaptativeBehaviors]['+index+'][baseline]" type="text"></span><span class="trash"><i class="fa fa-trash trash"></i></span></td>');
		$('#behavior-add').fadeToggle();
		
	}
})

$(".fa-plus-replacement").on("click",function(){
	$('#replacement-add').fadeToggle();
})
$('#replacement-add').on("keypress",function(event){
	if(event.which===13){
		var index=0;
		var element=$("#replacement-table .replacement-table-row:last-child input").attr("name");
		if(element!=undefined){
			index=Number(element.split("[")[2].split("]")[0])+1;	
		}
		
		console.log(index);
		$("#replacement-table").append('<tr class="replacement-table-row"></tr>')
		$("#replacement-table tr:last-child").append('<th scope="row"><input class="table-input" value="'+$(".replacement-name").val()+'"name="client[replacementsBehaviors]['+index+'][name]" type="text"></th>');
		$("#replacement-table tr:last-child").append('<td><span><input class="table-input" value="'+$(".replacement-baseline").val()+'"name="client[replacementsBehaviors]['+index+'][baseline]" type="text"></span><span class=" trash"><i class="fa fa-trash"></i></span></td>');
		$('#replacement-add').fadeToggle();
		
	}
})

$(".fa-plus-approval").on("click",function(){
	$('#approval-add').fadeToggle();
})
$('#approval-add').on("keypress",function(event){
	if(event.which===13){
		var index=0;
		var element=$("#approval-table .approval-table-row:last-child input").attr("name");
		if(element!=undefined){
			index=Number(element.split("[")[2].split("]")[0])+1;	
		}
		console.log(index);
		$("#approval-table").append('<tr class="approval-table-row"></tr>')
		$("#approval-table tr:last-child").append('<th scope="row"><input class="table-input" value="'+$(".approval-number").val()+'"name="client[approvals]['+index+'][number]" type="text"></th>');
		$("#approval-table tr:last-child").append('<td><input class="table-input" value="'+$(".approval-start").val()+'"name="client[approvals]['+index+'][startDate]" type="date"></td>');
		$("#approval-table tr:last-child").append('<td><input class="table-input" value="'+$(".approval-end").val()+'"name="client[approvals]['+index+'][endDate]" type="date"></td>');
		$("#approval-table tr:last-child").append('<td><input class="table-input" value="'+$(".approval-units").val()+'"name="client[approvals]['+index+'][units]" type="text"></td>');
		$("#approval-table tr:last-child").append('<td><span><input class="table-input" value="'+$(".approval-procedure").val()+'"name="client[approvals]['+index+'][procedure]" type="text"></span><span class="trash"><i class="fa fa-trash"></i></span></td>');
		$("#approval-table tr:last-child").append('<td style="display:none"><input class="table-input" value="'+$(".approval-units").val()+'"name="client[approvals]['+index+'][availableUnits]" type="text"></td>');
		$('#approval-add').fadeToggle();
		
	}
})

$(".trash").on("click",function(event){
	$(this).parent().parent().fadeOut(500,function(){
		$(this).remove();
	});
	event.stopPropagation();
})

$(document).on('submit', 'form', function(e) {
    if (e.delegateTarget.activeElement.type!=="submit") {
        e.preventDefault();
    }
});