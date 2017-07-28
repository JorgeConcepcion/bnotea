/* global $ */
$(".cellTrial").on("click", function () {
    if ($(this).text() != "X") {
        let col = $(this).attr("id").split("T")[0];
        let row = $(this).attr("id").split("T")[1];
        let query = "#" + col;
        let currentDayTrials = Number($(query).attr("value"));
        let trialsTotal = Number($("#trialsTotal").text()) + Number(row) - ($(query).attr("value"));
        $("#trialsTotal").text(trialsTotal);
        $(query).attr("value", row);
        for (let i = row; i > currentDayTrials; i--) {
            query = '#' + col + "T" + i;
            $(query).text("X");
            query = '#' + col + "C" + i;
            $(query).text("No");
            $(query).addClass("No");
            query = "#" + col + "N" + i;
            $(query).attr("value", 0);
        }
    }
    else {
        let col = $(this).attr("id").split("T")[0];
        let row = $(this).attr("id").split("T")[1];
        let query = "#" + col;
        let trialsTotal = Number($("#trialsTotal").text()) + Number(row) - ($(query).attr("value")) - 1;
        $("#trialsTotal").text(trialsTotal);
        $(query).attr("value", row - 1);
        for (let i = row; i <= 20; i++) {
            query = '#' + col + "T" + i;
            $(query).text("");
            query = '#' + col + "C" + i;
            if ($(query).text() == "Yes") {
                $("#trialsCompleted").text(Number($("#trialsCompleted").text()) - 1);
            }
            $(query).text("");
            query = "#" + col + "N" + i;
            $(query).attr("value", "");
        }
    }
    let trialsCompleted = Number($("#trialsCompleted").text());
    let trialsTotal = Number($("#trialsTotal").text());
    let porcentage = Math.round((trialsCompleted / trialsTotal) * 10000) / 100;
    $("#porcentage").text(porcentage);

});

$(".cellCompletion").on("click", function () {
    let val;
    let completed = $(this).text();
    if (completed == "Yes") {
        $(this).removeClass("Yes");
        $(this).addClass("No");
        completed = "No";
        $("#trialsCompleted").text(Number($("#trialsCompleted").text()) - 1);
    }
    else if (completed == "No") {
        $(this).removeClass("No");
        $(this).addClass("Yes");
        $("#trialsCompleted").text(Number($("#trialsCompleted").text()) + 1);
        completed = "Yes";
    }
    $(this).text(completed);
    let col = $(this).attr("id").split("C")[0];
    let row = $(this).attr("id").split("C")[1];
    let query = "#" + col + "N" + row;
    if (completed == "Yes") {
        val = 1;
    }
    else if (completed == "No") {
        val = 0;
    }
    $(query).attr("value", val);
    let trialsCompleted = Number($("#trialsCompleted").text());
    let trialsTotal = Number($("#trialsTotal").text());
    let porcentage = Math.round((trialsCompleted / trialsTotal) * 10000) / 100;
    $("#porcentage").text(porcentage);
});

$(".submit").on("click", function (e) {
    let frequency = Number($("#porcentage").text());
    let baseline = Number($("#baseline").text());
    let trials = Number($("#trialsTotal").text());
    if (trials > 35) {
        e.preventDefault();
        $.alert("There are too many trials for one week (max 35)", {
            position: ['center', [-0.42, 0]],
            title: false // title
        });
    }
    else if ($("#1").attr("value") == "0" || $("#2").attr("value") == "0" || $("#3").attr("value") == "0" || $("#4").attr("value") == "0" || $("#5").attr("value") == "0" || $("#6").attr("value") == "0" || $("#7").attr("value") == "0") {
        e.preventDefault();
        $.alert("All the days must be filled", {
            position: ['center', [-0.42, 0]],
            title: false // title
        });
    }
    else if (frequency - baseline >= 5 || baseline - frequency >= 5) {
        e.preventDefault();
        $.alert("Completion porcentage is too far from the baseline ", {
            position: ['center', [-0.42, 0]],
            title: false // title
        });
    }
    else if ($(".analist-input").attr("value") == "" || $(".assistant-input").attr("value") == "" || $(".caregiver-input").attr("value") == "") {
        e.preventDefault();
        $.alert("The entire document needs to be signed", {
            position: ['center', [-0.42, 0]],
            title: false // title
        });
    }
    $("#button").attr("value", "submit");
});