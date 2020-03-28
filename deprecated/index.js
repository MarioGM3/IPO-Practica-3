
document.addEventListener("DOMContentLoaded", function (event) {
	window.MapApplication = new MapController(SalamancaMapData, SalamancaTurismData);
	MapApplication.init();

	window.BarchartApplication = new BarchartController(SalamancaTurismData);
	BarchartApplication.init();

});