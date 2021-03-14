sap.ui.define([
	"com/magenta_ProdConfirmation/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"
], function(Controller, JSONModel, Filter, FilterOperator, Fragment, MessageBox) {
	"use strict";

	return Controller.extend("com.magenta_ProdConfirmation.controller.Orders", {

		/*
			Helper Methods
	    */

		_onItemMatched: function(oEvent) {

			var oArgs = oEvent.getParameter("arguments");
			this._pPlant = oArgs.Plant;
			this._pProdline = oArgs.Prodline;
			this._pSupervisor = oArgs.Supervisor;
			this._pDate = oArgs.Date;

			var tbOrders = this.byId("tbOrders");
			var oProdOrders = this._readProdOrders(tbOrders);

			oProdOrders.then(function(oResult) {
				var oProdOrdModel = new JSONModel(oResult);
				tbOrders.setModel(oProdOrdModel, "oProdOrdModel");
			});

			oProdOrders.catch(function(oError) {
				var oResponseText = JSON.parse(oError.responseText);
				var sMessage = oResponseText.error.message.value;
				MessageBox.error(sMessage);
				return;
			});

		},

		_getParamters: function(sParameters) {

			return sParameters.split("|");

		},

		_removeDuplicates: function(aValues) {
			var aResult = [];
			$.each(aValues, function(i, el) {
				if ($.inArray(el, aResult) === -1) {
					aResult.push(el);
				}
			});
			return aResult;
		},

		_readProdOrders: function(oTable) {

			var oView = this.getView();
			var oModel = oView.getModel("oModel");
			oTable.setBusy(true);

			var aFilters = [];
			if (this._pPlant !== "-") {
				var aSplit = this._getParamters(this._pPlant);
				aSplit.forEach(function(oItem) {
					var oFilter = new Filter("Plant", FilterOperator.EQ, oItem);
					aFilters.push(oFilter);
				});

			}
			if (this._pProdline !== "-") {
				aSplit = this._getParamters(this._pProdline);
				aSplit.forEach(function(oItem) {
					var oFilter = new Filter("Prodline", FilterOperator.EQ, oItem);
					aFilters.push(oFilter);
				});
			}
			if (this._pSupervisor !== "-") {
				aSplit = this._getParamters(this._pSupervisor);
				aSplit.forEach(function(oItem) {
					var oFilter = new Filter("Supervisor", FilterOperator.EQ, oItem);
					aFilters.push(oFilter);
				});
			}
			if (this._pDate !== "-") {
				aSplit = this._getParamters(this._pDate);
				var oSDate = new Date(aSplit[0]);
				var oEDate = new Date(aSplit[1]);
				var oFilter = new Filter("Proddate", FilterOperator.BT, oSDate, oEDate);
				aFilters.push(oFilter);
			}

			return new Promise(function(resolve, reject) {
				oModel.read("/ProdOrdersSet", {
					filters: [aFilters],
					success: function(oResult) {
						resolve(oResult);
						oTable.setBusy(false);
					},
					error: function(oError) {
						reject(oError);
						oTable.setBusy(false);
					}
				});
			});
		},

		_readMatdocitems: function(sOrderid, oTable) {

			var oView = this.getView();
			var oModel = oView.getModel("oModel");
			oTable.setBusy(true);

			var oFilter = new Filter("Orderid", FilterOperator.EQ, sOrderid);

			return new Promise(function(resolve, reject) {
				oModel.read("/MatdocitemSet", {
					filters: [oFilter],
					success: function(oResult) {
						resolve(oResult);
						oTable.setBusy(false);
					},
					error: function(oError) {
						reject(oError);
						oTable.setBusy(false);
					}
				});
			});
		},

		_postMatDoc: function(aData, oTable) {

			var oView = this.getView();
			var oModel = oView.getModel("oModel");

			oTable.setBusy(true);

			var aMatDocitems = aData;

			var oMatdochead = {
				Orderid: aMatDocitems[0].Orderid,
				Matdoc: "",
				Matyear: "",
				ToMatdocitem: aMatDocitems
			};

			var that = this;
			oModel.create("/MatdocheadSet", oMatdochead, {
				success: function(oResult) {
					oTable.setBusy(false);

					var sSMessage = that._geti18nText("msgSMatDocPosted") + " : " + oResult.Matdoc + "/" + oResult.Matyear;
					MessageBox.success(sSMessage);
				},
				error: function(oError) {
					oTable.setBusy(false);

					var oMsg,
						sEMessage;

					try {

						oMsg = JSON.parse(oError.responseText);
						sEMessage = oMsg.error.message.value;

					} catch (err) {

						var oParser = new DOMParser();
						var oXmlDoc = oParser.parseFromString(oError.responseText, "text/xml");
						sEMessage = oXmlDoc.getElementsByTagName("message")[0].childNodes[0].nodeValue;

					}

					MessageBox.error(sEMessage);

				}
			});
		},

		_postConfirmation: function(oData, oTable) {

			var oView = this.getView();
			var oModel = oView.getModel("oModel");

			oView.setBusy(true);

			var that = this;
			oModel.create("/ProdOrdersSet", oData, {
				success: function(oResult) {
					oView.setBusy(false);
					var sSMessage = that._geti18nText("msgSOrderConfirmed");
					MessageBox.success(sSMessage);

					var oProdOrders = that._readProdOrders(oTable);

					oProdOrders.then(function(oOrders) {
						var oProdOrdModel = new JSONModel(oOrders);
						oTable.setModel(oProdOrdModel, "oProdOrdModel");
					});

					oProdOrders.catch(function(oError) {

					});

				},
				error: function(oError) {
					oView.setBusy(false);

					var oMsg,
						sEMessage;

					try {

						oMsg = JSON.parse(oError.responseText);
						sEMessage = oMsg.error.message.value;

					} catch (err) {

						var oParser = new DOMParser();
						var oXmlDoc = oParser.parseFromString(oError.responseText, "text/xml");
						sEMessage = oXmlDoc.getElementsByTagName("message")[0].childNodes[0].nodeValue;

					}

					MessageBox.error(sEMessage);
				}
			});
		},

		/*
			Events
		 */

		onInit: function() {

			var oRouter = this._getRouter();
			oRouter.getRoute("Orders").attachMatched(this._onItemMatched, this);

		},

		onPrintLabelsPress: function() {

			var oTable = this.byId("tbOrders");
			var aPlants = [],
				aOrders = [];
			var aSelected = oTable.getSelectedContexts();

			if (aSelected.length === 0) {
				MessageBox.error(this._geti18nText("msgESelectItem"));
				return;
			}

			aSelected.forEach(function(oItem) {
				aPlants.push(oItem.getObject().Plant);
				aOrders.push(oItem.getObject().Ordno);
			});

			aPlants = this._removeDuplicates(aPlants);

			if (aPlants.length > 1) {
				MessageBox.error(this._geti18nText("msgEMultiplePlants"));
				return;
			}

			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var hashUrl = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "ZPP_COPI",
					action: "print"
				},
				params: {
					"Werks": aPlants[0],
					"Aufnr1": aOrders[0],
					"Aufnr2": aOrders[aOrders.length - 1]
				}
			}));
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hashUrl
				}
			});

		},

		onBreakdownPress: function() {

			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var hashUrl = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "MaintenanceJob",
					action: "reportMalfunction"
				}
			}));
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hashUrl
				}
			});

		},

		onGoodsIssuePress: function() {

			var oView = this.getView();

			if (!this._pGoodsIssueDialog) {
				this._pGoodsIssueDialog = Fragment.load({
					id: oView.getId(),
					name: "com.magenta_ProdConfirmation.view.GoodsIssueDialog",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			var tbOrders = this.byId("tbOrders");
			var aOrders = [];
			var aSelected = tbOrders.getSelectedContexts();

			if (aSelected.length === 0) {
				MessageBox.error(this._geti18nText("msgESelectItem"));
				return;
			}

			aSelected.forEach(function(oItem) {
				aOrders.push(oItem.getObject().Ordno);
			});

			aOrders = this._removeDuplicates(aOrders);

			if (aOrders.length > 1) {
				MessageBox.error(this._geti18nText("msgEMultipleOrders"));
				return;
			}

			var tbMatdoclines = this.byId("tbMatdoclines");
			var oMatdocitems = this._readMatdocitems(aOrders[0], tbMatdoclines);

			oMatdocitems.then(function(oResult) {

				var oMatdocModel = new JSONModel(oResult);
				tbMatdoclines.setModel(oMatdocModel, "oMatdocModel");
			});

			oMatdocitems.catch(function(oError) {
				var oResponseText = JSON.parse(oError.responseText);
				var sMessage = oResponseText.error.message.value;
				MessageBox.error(sMessage);
				return;
			});

			this._pGoodsIssueDialog.then(function(oDialog) {
				oDialog.open();
			});

		},

		onPostMatdoc: function() {

			var oTable = this.byId("tbMatdoclines");
			var aSelected = oTable.getSelectedContexts();

			if (aSelected.length === 0) {
				MessageBox.error(this._geti18nText("msgESelectItem"));
				return;
			}

			var aMatDocitems = [];

			var bBatch = false;
			var bQty = false;

			aSelected.forEach(function(oLine) {

				var oObj = oLine.getObject();

				if (!oObj.Batch) {
					bBatch = true;
				}

				if (!oObj.EntryQnt) {
					bQty = true;
				}

				var oItem = {
					Orderid: oObj.Orderid,
					OrderItno: oObj.OrderItno,
					ReservNo: oObj.ReservNo,
					ResItem: oObj.ResItem,
					Material: oObj.Material,
					Plant: oObj.Plant,
					StgeLoc: oObj.StgeLoc,
					Batch: oObj.Batch,
					MoveType: oObj.MoveType,
					EntryUom: oObj.EntryUom,
					EntryQnt: oObj.EntryQnt
				};

				aMatDocitems.push(oItem);
			});

			if (bBatch) {
				MessageBox.error(this._geti18nText("msgEBlankBatch"));
				return;
			}

			if (bQty) {
				MessageBox.error(this._geti18nText("msgEBlankQty"));
				return;
			}

			this._postMatDoc(aMatDocitems, oTable);
		},

		onConfirmationPress: function() {

			var oTable = this.byId("tbOrders");
			var aSelected = oTable.getSelectedContexts();

			if (aSelected.length === 0) {
				MessageBox.error(this._geti18nText("msgESelectItem"));
				return;
			}

			if (aSelected.length > 1) {
				MessageBox.error(this._geti18nText("msgEMultipleItems"));
				return;
			}

			var ProdOrder = aSelected[0].getObject();

			if (ProdOrder.Yield === "0.00") {
				MessageBox.error(this._geti18nText("msgEBlankYield"));
				return;
			}

			if (!ProdOrder.Proddate) {
				ProdOrder.Proddate = new Date();
			}

			this._postConfirmation(ProdOrder,oTable);

		},

		onCloseGoodsIssueDialog: function() {
			this._pGoodsIssueDialog.then(function(oDialog) {
				oDialog.close();
			});
		}
	});

});