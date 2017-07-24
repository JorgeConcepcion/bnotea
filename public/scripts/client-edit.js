//Show the add behavior fields
$(".fa-plus-behavior").on("click", function () {
	$('#behavior-add').fadeToggle();
});

//Add new behavior to the behavior table
$('#behavior-add').on("keypress", function (event) {
	if (event.which === 13) {
		var index = 0;
		var element = $("#behavior-table .behavior-table-row:last-child input").attr("name");
		if (element != undefined) {
			index = Number(element.split("[")[2].split("]")[0]) + 1;
		}

		$("#behavior-table").append('<tr class="behavior-table-row"></tr>')
		$("#behavior-table tr:last-child").append('<th scope="row"><input class="table-input" value="' + $(".behavior-name").val() + '"name="client[maladaptativeBehaviors][' + index + '][name]" type="text" data-validation="required" data-validation-error-msg="The maladaptative behavior name is required"></th>');
		$("#behavior-table tr:last-child").append('<td><span><input class="table-input" value="' + $(".behavior-baseline").val() + '"name="client[maladaptativeBehaviors][' + index + '][baseline]" type="text" data-validation="number" data-validation-allowing="range[0;150]"   data-validation-error-msg="The baseline is required"></span><span class="trash"><i class="fa fa-trash trash"></i></span></td>');
		$('#behavior-add').fadeToggle();

	}
});

//Show the add replacement fields
$(".fa-plus-replacement").on("click", function () {
	$('#replacement-add').fadeToggle();
});

//Add new replacement to the replacement table
$('#replacement-add').on("keypress", function (event) {
	if (event.which === 13) {
		var index = 0;
		var element = $("#replacement-table .replacement-table-row:last-child input").attr("name");
		if (element != undefined) {
			index = Number(element.split("[")[2].split("]")[0]) + 1;
		}
		console.log(index);
		$("#replacement-table").append('<tr class="replacement-table-row"></tr>')
		$("#replacement-table tr:last-child").append('<th scope="row"><input class="table-input" value="' + $(".replacement-name").val() + '"name="client[replacementsBehaviors][' + index + '][name]" type="text" data-validation="required" data-validation-error-msg="The replacement behavior name is required"></th>');
		$("#replacement-table tr:last-child").append('<td><span><input class="table-input" value="' + $(".replacement-baseline").val() + '"name="client[replacementsBehaviors][' + index + '][baseline]" type="text" data-validation="number" data-validation-allowing="range[0;100]" data-validation-error-msg="The baseline is required"></span><span class=" trash"><i class="fa fa-trash"></i></span></td>');
		$('#replacement-add').fadeToggle();

	}
});

//Show the add approval fields
$(".fa-plus-approval").on("click", function () {
	$('#approval-add').fadeToggle();
});

//Add new approval to the approval table
$('#approval-add').on("keypress", function (event) {
	if (event.which === 13) {
		var index = 0;
		var element = $("#approval-table .approval-table-row:last-child input").attr("name");
		if (element != undefined) {
			index = Number(element.split("[")[2].split("]")[0]) + 1;
		}
		console.log(index);
		$("#approval-table").append('<tr class="approval-table-row"></tr>')
		$("#approval-table tr:last-child").append('<th scope="row"><input class="table-input" value="' + $(".approval-number").val() + '"name="client[approvals][' + index + '][number]" type="text" data-validation="number" data-validation-allowing="range[1000000000;9999999999]"  data-validation-optional="true" data-validation-error-msg="The approval number must be 10 digits"></th>');
		$("#approval-table tr:last-child").append('<td><input class="table-input" value="' + $(".approval-start").val() + '"name="client[approvals][' + index + '][startDate]" type="date"  data-validation="required" data-validation-error-msg="The start date is required"></td>');
		$("#approval-table tr:last-child").append('<td><input class="table-input" value="' + $(".approval-end").val() + '"name="client[approvals][' + index + '][endDate]" type="date"  data-validation="required" data-validation-error-msg="The end date is required"></td>');
		$("#approval-table tr:last-child").append('<td><input class="table-input" value="' + $(".approval-units").val() + '"name="client[approvals][' + index + '][units]" type="text" data-validation="number" data-validation-allowing="range[0;9999]"   data-validation-error-msg="The number of units is required"></td>');
		$("#approval-table tr:last-child").append('<td><span><input class="table-input" value="' + $(".approval-procedure").val() + '"name="client[approvals][' + index + '][procedure]" type="text" data-validation="required" data-validation-error-msg="The procedure is required"></span><span class="trash"><i class="fa fa-trash"></i></span></td>');
		$("#approval-table tr:last-child").append('<td style="display:none"><input class="table-input" value="' + $(".approval-units").val() + '"name="client[approvals][' + index + '][availableUnits]" type="text"></td>');
		$('#approval-add').fadeToggle();

	}
});

//Delete approvals, replacements and behaviors
$(".trash").on("click", function (event) {
	$(this).parent().parent().fadeOut(500, function () {
		$(this).remove();
	});
	event.stopPropagation();
});

//Stop the form from submitting by pressing enter
$(document).on('submit', 'form', function (e) {
	if (e.delegateTarget.activeElement.type !== "submit") {
		e.preventDefault();
	}
});


