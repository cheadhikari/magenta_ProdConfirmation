sap.ui.define([
	"com/magenta_ProdConfirmation/controller/BaseController",
	"sap/ui/core/Fragment",
	'sap/m/Token',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, Fragment, Token, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("com.magenta_ProdConfirmation.controller.Selection", {

		onInit: function() {

		},

		handlePlantValueHelp: function(oEvent) {
			var oView = this.getView();
			if (!this._pPlantDialog) {
				this._pPlantDialog = Fragment.load({
					id: oView.getId(),
					name: "com.magenta_ProdConfirmation.view.PlantValueHelpDialog",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pPlantDialog.then(function(oDialog) {
				oDialog.open();
			});
		},

		handleProdlineValueHelp: function(oEvent) {
			var oView = this.getView();
			if (!this._pProdlineDialog) {
				this._pProdlineDialog = Fragment.load({
					id: oView.getId(),
					name: "com.magenta_ProdConfirmation.view.ProdlineValueHelpDialog",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pProdlineDialog.then(function(oDialog) {
				oDialog.open();
			});
		},

		handleSupervisorValueHelp: function(oEvent) {
			var oView = this.getView();
			if (!this._pSupervisorDialog) {
				this._pSupervisorDialog = Fragment.load({
					id: oView.getId(),
					name: "com.magenta_ProdConfirmation.view.SupervisorValueHelpDialog",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pSupervisorDialog.then(function(oDialog) {
				oDialog.open();
			});
		},

		handlePlantSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter1 = new Filter("Werks", FilterOperator.Contains, sValue);
			var oFilter2 = new Filter("Name1", FilterOperator.Contains, sValue);
			var aFilter = new Filter([oFilter1, oFilter2], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(aFilter);
		},

		handleProdlineSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			//var oFilter1 = new Filter("Werks", FilterOperator.Contains, sValue);
			// var oFilter2 = new Filter("Stand", FilterOperator.Contains, sValue);
			var oFilter3 = new Filter("Ktext", FilterOperator.Contains, sValue);
			var aFilter = new Filter([oFilter3], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(aFilter);
		},

		handleSupervisorSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			//var oFilter1 = new Filter("Werks", FilterOperator.Contains, sValue);
			//var oFilter2 = new Filter("Fevor", FilterOperator.Contains, sValue);
			var oFilter3 = new Filter("Txt", FilterOperator.Contains, sValue);
			var aFilter = new Filter([oFilter3], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(aFilter);
		},

		handlePlantClose: function(oEvent) {
			var omiPlant = this.byId("miPlant");

			var aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts && aContexts.length) {

				omiPlant.destroyTokens();

				aContexts.forEach(function(oContext) {

					var sKey = oContext.getObject().Werks;
					var sText = oContext.getObject().Werks + "-" + oContext.getObject().Name1;

					omiPlant.addToken(new Token({
						key: sKey,
						text: sText
					}));

				});

			}
		},

		handleProdlineClose: function(oEvent) {
			var omiProdline = this.byId("miProdline");

			var aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts && aContexts.length) {

				omiProdline.destroyTokens();

				aContexts.forEach(function(oContext) {

					var sKey = oContext.getObject().Stand;
					var sText = oContext.getObject().Stand + "-" + oContext.getObject().Ktext;

					omiProdline.addToken(new Token({
						key: sKey,
						text: sText
					}));

				});

			}
		},

		handleSupervisorClose: function(oEvent) {
			var omiProdline = this.byId("miSupervisor");

			var aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts && aContexts.length) {

				omiProdline.destroyTokens();

				aContexts.forEach(function(oContext) {

					var sKey = oContext.getObject().Fevor;
					var sText = oContext.getObject().Fevor + "-" + oContext.getObject().Txt;

					omiProdline.addToken(new Token({
						key: sKey,
						text: sText
					}));

				});

			}
		},

		onSearch: function(oEvent) {

			var miPlant = this.byId("miPlant");
			var aPlants = miPlant.getTokens();
			var sPlants = "-";

			if (aPlants && aPlants.length) {
				aPlants.forEach(function(oItem) {

					if (sPlants === "-") {
						sPlants = oItem.getKey();
					} else {
						sPlants = sPlants + "|" + oItem.getKey();
					}

				});
			}

			var miProdline = this.byId("miProdline");
			var aProdlines = miProdline.getTokens();
			var sProdlines = "-";

			if (aProdlines && aProdlines.length) {
				aProdlines.forEach(function(oItem) {

					if (sProdlines === "-") {
						sProdlines = oItem.getKey();
					} else {
						sProdlines = sProdlines + "|" + oItem.getKey();
					}

				});
			}

			var miSupervisor = this.byId("miSupervisor");
			var aSupervisors = miSupervisor.getTokens();
			var sSupervisors = "-";

			if (aSupervisors && aSupervisors.length) {
				aSupervisors.forEach(function(oItem) {

					if (sSupervisors === "-") {
						sSupervisors = oItem.getKey();
					} else {
						sSupervisors = sSupervisors + "|" + oItem.getKey();
					}

				});
			}

			var drsDate = this.byId("drsDate");
			var sDate = "-";
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy.MM.dd"
			});
			var sFromDate = oDateFormat.format(drsDate.getDateValue());
			var sToDate = oDateFormat.format(drsDate.getSecondDateValue());
			if (sFromDate && sToDate) {
				sDate = sFromDate + "|" + sToDate;
			}

			this._getRouter().navTo("Orders", {
				Plant: sPlants,
				Prodline: sProdlines,
				Supervisor: sSupervisors,
				Date: sDate
			});

		}

	});
});