sap.ui.define([
	"com/magenta_ProdConfirmation/controller/BaseController",
	"sap/ui/core/Fragment",
	'sap/m/Token',
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, Fragment, Token, JSONModel, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("com.magenta_ProdConfirmation.controller.Selection", {

		/*
			Helper Methods
		*/
		_readResources: function(aPlants) {

			var oView = this.getView();
			var oModel = oView.getModel("oModel");
			oView.setBusy(true);

			var aFilter = [];

			if (aPlants && aPlants.length) {
				aPlants.forEach(function(oItem) {
					var oFilter = new Filter("Plant", FilterOperator.EQ, oItem.getKey());
					aFilter.push(oFilter);
				});
			}

			return new Promise(function(resolve, reject) {
				oModel.read("/ResourceSearchSet", {
					filters: aFilter,
					success: function(oResult) {
						resolve(oResult);
						oView.setBusy(false);
					},
					error: function(oError) {
						reject(oError);
						oView.setBusy(false);
					}
				});
			});
		},

		/*
			Events
		*/

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

		handleResourceValueHelp: function(oEvent) {
			var oView = this.getView();
			if (!this._pResourceDialog) {
				this._pResourceDialog = Fragment.load({
					id: oView.getId(),
					name: "com.magenta_ProdConfirmation.view.ResourceValueHelpDialog",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			var miPlant = this.byId("miPlant");
			var aPlants = miPlant.getTokens();

			var oResources = this._readResources(aPlants);

			var that = this;
			oResources.then(function(oResult) {
				var oResourcesModel = new JSONModel(oResult);
				that._pResourceDialog.then(function(oDialog) {
					oDialog.setModel(oResourcesModel, "oResourcesModel");
					oDialog.open();
				});
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
			var oFilter1 = new Filter("Ktext", FilterOperator.Contains, sValue);
			var aFilter = new Filter([oFilter1], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(aFilter);
		},

		handleResourceSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter1 = new Filter("Resrc", FilterOperator.Contains, sValue);
			var aFilter = new Filter([oFilter1], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(aFilter);
		},

		handleSupervisorSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter1 = new Filter("Txt", FilterOperator.Contains, sValue);
			var aFilter = new Filter([oFilter1], false);
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

		handleResourceClose: function(oEvent) {
			var miResource = this.byId("miResource");

			var aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts && aContexts.length) {

				miResource.destroyTokens();

				aContexts.forEach(function(oContext) {

					var sKey = oContext.getObject().Resrc;
					var sText = oContext.getObject().Resrc;

					miResource.addToken(new Token({
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

			var mcbOrderNo = this.byId("mcbOrderNo");
			var aOrdno = mcbOrderNo.getSelectedItems();
			var sOrdno = "-";

			if (aOrdno && sOrdno.length) {
				aOrdno.forEach(function(oItem) {

					if (sOrdno === "-") {
						sOrdno = oItem.getText();
					} else {
						sOrdno = sOrdno + "|" + oItem.getText();
					}

				});
			}

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
			
			var miResource = this.byId("miResource");
			var aResources = miResource.getTokens();
			var sResources = "-";

			if (aResources && aResources.length) {
				aResources.forEach(function(oItem) {

					if (sResources === "-") {
						sResources = oItem.getKey();
					} else {
						sResources = sResources + "|" + oItem.getKey();
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
				pattern: "yyyy.MM.dd",
				UTC: false
			});

			if (drsDate.getDateValue()) {
				var sFromDate = oDateFormat.format(drsDate.getDateValue());
			}

			if (drsDate.getSecondDateValue()) {
				var sToDate = oDateFormat.format(drsDate.getSecondDateValue());
			}

			if (sFromDate && sToDate) {
				sDate = sFromDate + "|" + sToDate;
			}

			this._getRouter().navTo("Orders", {
				Ordno: sOrdno,
				Plant: sPlants,
				Prodline: sProdlines,
				Resource: sResources,
				Supervisor: sSupervisors,
				Date: sDate
			});

		}

	});
});