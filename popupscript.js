/*This runs immediately when the user presses submit, and adds key:value pairs to local storage.
The checkedBag value is an int, the carryon value is an int, the cancelled value is an int where 
1 represents true, 0 false.*/

$(document).ready(function() {
    $("input[id='checkboxTwoInput']").on("change", function() {
        if ($(this).is(":checked"))
            $(this).val("1");
        else
            $(this).val("0");
        console.log(document.getElementById("checkboxTwoInput").value);
    });

    $("input[id='checkboxThreeInput']").on("change", function() {
        if ($(this).is(":checked"))
            $(this).val("1");
        else
            $(this).val("0");
        console.log(document.getElementById("checkboxThreeInput").value);
    });

    document.getElementById("submitPrefs").addEventListener("click", function(form) {
        chrome.storage.sync.set({
            'checked': parseInt(document.getElementById("checkedBags").value)
        }, function() {
            message('checkedBags stored');
        });
        chrome.storage.sync.set({
            'carryon': parseInt(document.getElementById("checkboxTwoInput").value)
        }, function() {
            message('carryonBags stored');
        });
        chrome.storage.sync.set({
            'cancel': parseInt(document.getElementById("checkboxThreeInput").value)
        }, function() {
            message('cancellations stored');
        });
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.update(tabs[0].id, {
                url: tabs[0].url
            });
        });
        window.close();
    });

    var slider = document.getElementById("checkedBags");
    var output = document.getElementById("sliderResult");
    output.innerHTML = slider.value; // Display the default slider value

    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function() {
        output.innerHTML = this.value;
    }
})