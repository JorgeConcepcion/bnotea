/* global $ */
$(".fa.fa-plus").on("click", function () {
    var index;
    var element = $(".selectpicker").last().attr("name");
    if (element == undefined) {
        index = 0;
    }
    else {
        index = Number(element.split("[")[1].split("]")[0]) + 1;
    }
    $(".performance-row").append('<td class="' + index + '">' +
        '<div class="form-group">' +
        '<select class="selectpicker" data-width="100%" name="performance[' + index + ']" title="Supervisee performance" data-validation="required">' +
        '<option data-subtext="No response">0</option>' +
        '<option data-subtext="Verbal cues and modeling">1</option>' +
        '<option data-subtext="Verbal cues and pointing">2</option>' +
        '<option data-subtext="Verbal cues">3</option>' +
        '<option data-subtext="Independent">4</option>' +
        '</select>' +
        '</div>' +
        '</td>');
    $(".date-row").append('<th class="' + index + '">' +
        '<div class="form-group text-center">' +
        '<label><span class="trash"><i class="fa fa-trash" ></i></span> Date:</label>' +
        '<input class="form-control" type="date" name="date" data-validation="required">' +
        '</div>' +
        '</th>)');
    $(".selectpicker").selectpicker('refresh');
    $.validate({
        modules: 'security',
        errorMessagePosition: 'top',
        validateOnBlur: false
    });

});


$(document).on("click", ".trash", function (event) {
    var element = $(this).parent().parent().parent().attr("class");
    $("." + element).fadeOut(500, function () {
        $("." + element).remove();

    });
    event.stopPropagation();
});
