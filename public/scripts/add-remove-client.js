$('.list-group-item').on("click", function (event) {


    $("#client-table").append($(this).next("table").children("tbody").html());
    $("#client-table").find("input:last-child").removeAttr('disabled');
    $(this).remove();
});
$(".trash").on("click", function (event) {
    console.log($(this).parent().parent());
    $(this).parent().parent().fadeOut(500, function () {
        $(this).remove();
    });
    event.stopPropagation();
});
