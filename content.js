/* This runs through immediately when the user presses submit, and adds key:value pairs to local storage.
The checkedBag value is an int, the carryon value is an int, the cancelled value is an int where 
1 represents true, 0 false. */
chrome.storage.sync.get("checked", function(obj) {
	if (obj["checked"] == null) {
		checkedBag = 0;
	} else {
		checkedBag = obj["checked"];
	}
});

if (localStorage.getItem("carryon") == null) {
	var carryonBag = 0;
} else {
	var carryonBag = localStorage.getItem("carryon");
}

if (localStorage.getItem("cancelled") == null) {
	var ChangeFlights = false;
} else {
	var ChangeFlights = localStorage.getItem("cancelled");
}

/* Finds the price of a giving listing from the div or something. 
listing: the JSON object representing a single listing. */
function findPrice(listing) {
	var price = listing.getAttribute("aria-label");
	var pos = price.indexOf("$") + 1;
	var end = price.indexOf(" ", pos);
	price = price.slice(pos, end);
	price = parseInt(price);
	return price;
}

/* Finds the airline of a given listing from the div or something. Returns a list of airlines
of length 1. May return two airlines (list of length 2) in the case of Hacker Fare.

listing: the JSON object representing a single listing. */
function findAirline(listing) {
	var airline = listing.getElementsByClassName("bottom")[0];
	airline = airline.innerHTML;
	return airline;
}

/* Takes in a listing JSON object and an updated price and replaces the price in the
listing object with updatedPrice.

updatedPrice: int representing the new adjusted price.
listing: JSON object representing a single listing. */
function editListing(listing) {
	var price = findPrice(listing);
	var airline = findAirline(listing);
	var money = compute(airline, checkedBag, carryonBag, ChangeFlights)
	money = money * round_trip(listing);
	var flights = listing.getElementsByClassName("price option-text")[0];
	var a = (flights.innerHTML).slice(2);
	a = parseInt(a) + money;
	var b = "$" + (a);
	flights.innerHTML = b;
	$(listing).css("order", "" + a);
	if (money < 25) {
		$(flights).css("color", "DarkGreen");
		var elem = document.createElement("img");
		elem.setAttribute("src", '' + chrome.extension.getURL('images/pinGreen.png'));
		elem.setAttribute("height", "25");
		elem.setAttribute("margin-left", "4px");
		elem.setAttribute("width", "15");
		flights.appendChild(elem);
	} else if (money < 30) {
		$(flights).css("color", "Orange");
		var elem = document.createElement("img");
		elem.setAttribute("src", '' + chrome.extension.getURL('images/pinYellow.jpg'));
		elem.setAttribute("height", "25");
		elem.setAttribute("margin-left", "4px");
		elem.setAttribute("width", "20");
		flights.appendChild(elem);
	} else if (money < 70) {
		$(flights).css("color", "DarkOrange");
		var elem = document.createElement("img");
		elem.setAttribute("src", '' + chrome.extension.getURL('images/pinOrg.jpg'));
		elem.setAttribute("height", "25");
		elem.setAttribute("margin-left", "4px");
		elem.setAttribute("width", "20");
		flights.appendChild(elem);
	} else {
		$(flights).css("color", "DarkRed");
		var elem = document.createElement("img");
		elem.setAttribute("src", '' + chrome.extension.getURL('images/pinRed.jpg'));
		elem.setAttribute("height", "25");
		elem.setAttribute("margin-left", "4px");
		elem.setAttribute("width", "20");
		flights.appendChild(elem);
	}
}

/* Computes the updated price of a listing. Returns the updated price as an int.

airline: String representing the airline.
originalPrice: int representing the original price.
feeInformation: list of length 3 where index 0 is number of checked bags, 1 is carry on bags, 2 is
a 0 or 1 representing whether or not the customer may change flights. */
function compute(airline, checked, carry, change) {
	var checked_fees = calc_checked(checked, airline);
	var carry_fees = calc_carry(carry, airline);
	var change = change * calc_change(airline);
	return (checked_fees + carry_fees + change);
}

function calc_checked(checked, airline) {
	var add = 0;
	if (airline == "Delta" || airline == "United" || airline == "American Airlines") {
		if (checked > 0) {
			add = add + 25;
		}
		if (checked > 1) {
			add = add + 35;
		}
		if (checked > 2) {
			add = add + ((checked - 2) * 150);
		}
	}
	if (airline == "Alaska Airlines" || airline == "Virgin America" || airline == "JetBlue" || airline == "Sun Country Air") {
		if (checked > 0) {
			add = add + 25;
		}
		if (checked > 1) {
			add = add + 25;
		}
		if (checked > 2) {
			add = add + ((checked - 2) * 75);
		}
	}
	if (airline == "JetBlue") {
		if (checked > 0) {
			add = add + 25;
		}
		if (checked > 1) {
			add = add + 25;
		}
		if (checked > 2) {
			add = add + ((checked - 2) * 100);
		}
	}
	if (airline == "Frontier") {
		if (checked > 0) {
			add = add + 40;
		}
		if (checked > 1) {
			add = add + 45;
		}
		if (checked > 2) {
			add = add + ((checked - 2) * 85);
		}
	}
	if (airline == "Spirit Airlines") {
		if (checked > 0) {
			add = add + 55;
		}
		if (checked > 1) {
			add = add + 60;
		}
		if (checked > 2) {
			add = add + ((checked - 2) * 100);
		}
	}
	return add;
}

function calc_carry(checked, airline) {
	if (airline == "Frontier") {
		if (checked > 0) {
			return 40;
		}
	}
	if (airline == "Spirit Airlines") {
		if (checked > 0) {
			return 35;
		}
	}
	return 0;
}

function calc_change(airline) {
	var add = 0;
	if (airline == "Delta" || airline == "United" || airline == "American Airlines") {
		return 150;
	}
	if (airline == "Alaska Airlines" || airline == "Virgin America" || airline == "JetBlue") {
		return 125;
	}
	if (airline == "JetBlue") {
		return 0;
	}
	if (airline == "Frontier") {
		return 200;
	}
	if (airline == "Spirit Airlines") {
		return 200;
	}
	return 0;
}

function round_trip(listing) {
	if (!listing.getElementsByClassName("flight.with-gutter")) {
		return 1;
	}
	return 2;
};

function main() {
	$('.Base-Results-HorizonResult.Flights-Results-FlightResultItem').each(function(i, listing) {
		editListing(listing);
	});

	$("#searchResultsList").children().css('flex-direction', "column");
	$("#searchResultsList").children().css('display', "flex");
	$(".Common-Kn-Rp-FlightInline.smart").css('display', "none");
	$("body").append("<div id='hover-box' style='position:absolute; width:300px; height:350px;'></div>");
	$(document).on("mouseover", ".price.option-text", function() {

		$(this).fadeTo("slow", .5);
		var position = $(this).offset();
		var width = $(this).width();
		var height = $(this).height();
		$(document).on("mouseleave", ".price.option-text", function() {
			$(this).fadeTo("fast", 1);
		});

		$("#box-container").remove();
		$("#hover-point").remove();

		$("body").append("<div id='hover-box' style='position:absolute; width:100%; height:100%;'></div>");
		$("#hover-box").css("background-image", "url('" + chrome.extension.getURL("images/pineapple.jpg") + "')");
		$("#hover-box").css("background-position", "center, center");
		$("#hover-box").css("background-size", "cover");
		$("#hover-box").css("border-radius", "3em");
		$("#hover-box").css("z-index", "300");
		$("#hover-box").css("border", "1.2em");
		$("#hover-box").css("left", position.left + width + 35 + "px");
		$("#hover-box").css("top", position.top - 50 + "px");

		$("body").append("<div id='hover-point' style='position:absolute; width:0; height:0;'></div>");
		$("#hover-point").css("content", "''");
		$("#hover-point").css("left", position.left + width + "px");
		$("#hover-point").css("top", position.top + "px");
		$("#hover-point").css("border", "25px solid transparent");
		$("#hover-point").css("border-right-color", "#daf7fd");
		$("#hover-point").css("z-index", "299");
		$("#hover-point").css("margin-top", "-12px");
		$("#hover-point").css("margin-left", "-10px");

		$("#hover-box").append("<div id='box-container' style='text-align:center; padding:15px; margin:auto'></div>");

		var hoverListing = $(this).closest('.Base-Results-HorizonResult.Flights-Results-FlightResultItem')[0];
		var airline = findAirline(hoverListing);
		var origPrice = findPrice(hoverListing);
		var checkedFee = calc_checked(checkedBag, airline);
		var carryFee = calc_carry(carryonBag, airline);
		var changeFlightFee;

		$("#box-container").append("<span style='font-size:30px'>$" + origPrice + "</span><br><span>Original Price</span><br>");
		if (checkedFee > 0) {
			$("#box-container").append("<span style='font-size:30px'>+</span><br><span style='font-size:30px'>$" + checkedFee + " x 2</span><br><span>Checked Baggage (Round-trip)</span><br>");
		}
		if (carryFee > 0) {
			$("#box-container").append("<span style='font-size:30px'>+</span><br><span style='font-size:30px'>$" + carryFee + " x 2</span><br><span>Carry-on Baggage (Round-trip)</span><br>");
		}
		if (checkedFee == 0 && carryFee == 0) {
			$("#box-container").append("<span style='font-size:30px'>+</span><br><span style='font-size:30px'>$0</span><br><span>Extra Fees</span><br>");
		}
		$("#box-container").append("<span style='font-size:30px'>=</span><br><span style='font-size:36px'>$" + (origPrice + 2 * (checkedFee + carryFee)) + "</span>");
	});

	$(document).off('click').on('click', function(e) {
		var box = $("#hover-box");
		if (box != null && !box.is(e.target) && box.has(e.target).length === 0) {
			box.remove();
			$("#box-container").remove();
			$("#hover-point").remove();
		}
	});
}

$('.info-text').bind("DOMSubtreeModified", function() {
	if ($(this).text().length > 0) {
		main();
	}
});