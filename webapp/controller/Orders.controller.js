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
			this._pOrdno = oArgs.Ordno;
			this._pPlant = oArgs.Plant;
			this._pProdline = oArgs.Prodline;
			this._pResource = oArgs.Resource;
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

		_getIndexFromPath: function(oPath) {

			var iIndex = parseInt(oPath.substring(oPath.lastIndexOf('/') + 1), 10);

			return iIndex;
		},

		_readProdOrders: function(oTable) {

			var oView = this.getView();
			var oModel = oView.getModel("oModel");
			oTable.setBusy(true);

			var aFilters = [];
			if (this._pOrdno !== "-") {
				var aSplit = this._getParamters(this._pOrdno);
				aSplit.forEach(function(oItem) {
					var oFilter = new Filter("Ordno", FilterOperator.EQ, oItem);
					aFilters.push(oFilter);
				});

			}
			if (this._pPlant !== "-") {
				aSplit = this._getParamters(this._pPlant);
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
			if (this._pResource !== "-") {
				aSplit = this._getParamters(this._pResource);
				aSplit.forEach(function(oItem) {
					var oFilter = new Filter("Resrc", FilterOperator.EQ, oItem);
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
				var oFilter = new Filter("Finishdate", FilterOperator.BT, oSDate, oEDate);
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

		_readMatdocitems: function(sOrderid, sPhase, sMoveType, sProddate, oTable) {

			var oView = this.getView();
			var oModel = oView.getModel("oModel");
			oTable.setBusy(true);

			var oFilter1 = new Filter("Orderid", FilterOperator.EQ, sOrderid);
			var oFilter2 = new Filter("Phase", FilterOperator.EQ, sPhase);
			var oFilter3 = new Filter("MoveType", FilterOperator.EQ, sMoveType);
			var oFilter4 = new Filter("Proddate", FilterOperator.EQ, sProddate);

			return new Promise(function(resolve, reject) {
				oModel.read("/MatdocitemSet", {
					filters: [oFilter1, oFilter2, oFilter3, oFilter4],
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

		_readScrapReasons: function(sPlant, oDialog) {

			var oView = this.getView();
			var oModel = oView.getModel("oModel");
			oDialog.setBusy(true);

			var oFilter = new Filter("Plant", FilterOperator.EQ, sPlant);

			return new Promise(function(resolve, reject) {
				oModel.read("/ScrapReasonSet", {
					filters: [oFilter],
					success: function(oResult) {
						resolve(oResult);
						oDialog.setBusy(false);
					},
					error: function(oError) {
						reject(oError);
						oDialog.setBusy(false);
					}
				});
			});
		},

		_readBatches: function(sMaterial, sPlant, sStloc, oDialog) {

			var oView = this.getView();
			var oModel = oView.getModel("oModel");
			oDialog.setBusy(true);

			var oFilter1 = new Filter("Material", FilterOperator.EQ, sMaterial);
			var oFilter2 = new Filter("Plant", FilterOperator.EQ, sPlant);
			var oFilter3 = new Filter("Stloc", FilterOperator.EQ, sStloc);

			return new Promise(function(resolve, reject) {
				oModel.read("/BatchSearchSet", {
					filters: [oFilter1, oFilter2, oFilter3],
					success: function(oResult) {
						resolve(oResult);
						oDialog.setBusy(false);
					},
					error: function(oError) {
						reject(oError);
						oDialog.setBusy(false);
					}
				});
			});

		},

		_readWeighBridge: function(sPlant, sTerminal, oDialog) {

			var oView = this.getView();
			var oModel = oView.getModel("oModel");
			oDialog.setBusy(true);

			var oFilter1 = new Filter("Plant", FilterOperator.EQ, sPlant);
			var oFilter2 = new Filter("Terminal", FilterOperator.EQ, sTerminal);

			return new Promise(function(resolve, reject) {
				oModel.read("/WeighBridgeSet", {
					filters: [oFilter1, oFilter2],
					success: function(oResult) {
						resolve(oResult);
						oDialog.setBusy(false);
					},
					error: function(oError) {
						reject(oError);
						oDialog.setBusy(false);
					}
				});
			});
		},

		_readTechObj: function(sPpsid, oDialog) {

			var oView = this.getView();
			var oModel = oView.getModel("oModel");
			oDialog.setBusy(true);

			var oFilter = new Filter("Ppsid", FilterOperator.EQ, sPpsid);

			return new Promise(function(resolve, reject) {
				oModel.read("/TechObjSet", {
					filters: [oFilter],
					success: function(oResult) {
						resolve(oResult);
						oDialog.setBusy(false);
					},
					error: function(oError) {
						reject(oError);
						oDialog.setBusy(false);
					}
				});
			});
		},

		_readCombOrders: function(sOrdno, sYield, oDialog) {

			var oView = this.getView();
			var oModel = oView.getModel("oModel");
			oDialog.setBusy(true);

			var oFilter1 = new Filter("Ordno", FilterOperator.EQ, sOrdno);
			var oFilter2 = new Filter("Yield", FilterOperator.EQ, sYield);

			return new Promise(function(resolve, reject) {
				oModel.read("/CombOrdItemSet", {
					filters: [oFilter1, oFilter2],
					success: function(oResult) {
						resolve(oResult);
						oDialog.setBusy(false);
					},
					error: function(oError) {
						reject(oError);
						oDialog.setBusy(false);
					}
				});
			});

		},

		_postMatDoc: function(aData, oTable) {

			var oView = this.getView();
			var tbOrders = this.byId("tbOrders");
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

					var oProdOrders = that._readProdOrders(tbOrders);

					oProdOrders.then(function(oOrders) {
						var oProdOrdModel = new JSONModel(oOrders);
						tbOrders.setModel(oProdOrdModel, "oProdOrdModel");
					});

					oProdOrders.catch(function(oError) {

					});

					that._pGoodsIssueDialog.then(function(oDialog) {
						oDialog.close();
					});
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

		_postConfirmation: function(oData, oTable, oProdOrder) {

			var oView = this.getView();
			var oModel = oView.getModel("oModel");

			if (oData.Combined === "X") {

				// var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				// var hashUrl = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				// 	target: {
				// 		semanticObject: "ZPP_COR6N",
				// 		action: "confirm"
				// 	},
				// 	params: {
				// 		Aufnr: oData.Ordno,
				// 		Vornr: oData.Phase,
				// 		Lmnga: oData.Yield
				// 	}
				// }));
				// oCrossAppNavigator.toExternal({
				// 	target: {
				// 		shellHash: hashUrl
				// 	}
				// });

				if (!this._pCombOrdDialog) {
					this._pCombOrdDialog = Fragment.load({
						id: oView.getId(),
						name: "com.magenta_ProdConfirmation.view.CombOrdDialog",
						controller: this
					}).then(function(oDialog) {
						oView.addDependent(oDialog);
						return oDialog;
					});
				}

				var CombOrdDialog = this.byId("CombOrdDialog");
				var tbCombOrdItems = this.byId("tbCombOrdItems");

				var sOrdno = oProdOrder.Ordno;
				var sYield = oProdOrder.Yield;

				var oCombOrd = this._readCombOrders(sOrdno, sYield, CombOrdDialog);

				oCombOrd.then(function(oResult) {
					var oCombOrdItemModel = new JSONModel(oResult);
					tbCombOrdItems.setModel(oCombOrdItemModel, "oCombOrdItemModel");
				});

				oCombOrd.catch(function(oError) {

				});

				this._pCombOrdDialog.then(function(oDialog) {
					oDialog.open();
				});

				return;
			}

			oView.setBusy(true);

			var that = this;
			oModel.create("/ProdOrdersSet", oData, {
				success: function(oResult) {

					oView.setBusy(false);
					var sSMessage = that._geti18nText("msgSOrderConfirmed") + " : " + oResult.Ordno;
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

		_postCombOrd: function(oCombOrdHead, aCombOrdItems, oDialog, oTable) {

			var oView = this.getView();
			var tbOrders = this.byId("tbOrders");
			var oModel = oView.getModel("oModel");

			oDialog.setBusy(true);

			var oCombOrdHead = {
				Ordno: oCombOrdHead.Ordno,
				Phase: oCombOrdHead.Phase,
				Yield: oCombOrdHead.Yield,
				Proddate: oCombOrdHead.Proddate,
				ToCombOrdItem: aCombOrdItems
			};

			var that = this;
			oModel.create("/CombOrdHeadSet", oCombOrdHead, {
				success: function(oResult) {

					oDialog.setBusy(false);
					var sSMessage = that._geti18nText("msgSOrderConfirmed") + " : " + oResult.Ordno;
					MessageBox.success(sSMessage);

					var oProdOrders = that._readProdOrders(tbOrders);

					oProdOrders.then(function(oOrders) {
						var oProdOrdModel = new JSONModel(oOrders);
						tbOrders.setModel(oProdOrdModel, "oProdOrdModel");
					});

					oProdOrders.catch(function(oError) {

					});

					that._pCombOrdDialog.then(function(oCombOrdDialog) {
						oCombOrdDialog.close();
					});
				},
				error: function(oError) {
					oDialog.setBusy(false);

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

		onScrapPress: function() {

			var oView = this.getView();
			var tbOrders = this.byId("tbOrders");
			var aSelected = tbOrders.getSelectedContexts();

			if (aSelected.length === 0) {
				MessageBox.error(this._geti18nText("msgESelectItem"));
				return;
			}

			if (aSelected.length > 1) {
				MessageBox.error(this._geti18nText("msgEMultipleItems"));
				return;
			}

			if (!this._pScrapDialog) {
				this._pScrapDialog = Fragment.load({
					id: oView.getId(),
					name: "com.magenta_ProdConfirmation.view.ScrapDialog",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			var oBindingObject = aSelected[0].getObject();
			var ScrapDialog = this.byId("ScrapDialog");
			var inScrap = this.byId("inScrap");
			var selScrapRsn = this.byId("selScrapRsn");

			inScrap.setValue("");

			var sPlant = oBindingObject.Plant;
			var oScrapRsn = this._readScrapReasons(sPlant, ScrapDialog);

			oScrapRsn.then(function(oResult) {
				var oScrapRsnModel = new JSONModel(oResult);
				selScrapRsn.setModel(oScrapRsnModel, "oScrapRsnModel");
				selScrapRsn.setSelectedItem(null);
			});

			oScrapRsn.catch(function(oError) {
				var oResponseText = JSON.parse(oError.responseText);
				var sMessage = oResponseText.error.message.value;
				MessageBox.error(sMessage);
				return;
			});

			this._pScrapDialog.then(function(oDialog) {
				oDialog.open();
			});

		},

		onBreakdownPress: function() {

			var oView = this.getView();
			var tbOrders = this.byId("tbOrders");
			var aSelected = tbOrders.getSelectedContexts();

			if (aSelected.length === 0) {
				MessageBox.error(this._geti18nText("msgESelectItem"));
				return;
			}

			if (aSelected.length > 1) {
				MessageBox.error(this._geti18nText("msgEMultipleItems"));
				return;
			}

			var oObject = aSelected[0].getObject();
			var sObjid = oObject.Objid;

			if (!this._pTechObjDialog) {
				this._pTechObjDialog = Fragment.load({
					id: oView.getId(),
					name: "com.magenta_ProdConfirmation.view.TechObjDialog",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			var TechObjDialog = this.byId("TechObjDialog");
			var selTechObj = this.byId("selTechObj");
			var oTechObj = this._readTechObj(sObjid, TechObjDialog);

			oTechObj.then(function(oResult) {
				var oTechObjModel = new JSONModel(oResult);
				selTechObj.setModel(oTechObjModel, "oTechObjModel");
			});

			oTechObj.catch(function(oError) {
				var oResponseText = JSON.parse(oError.responseText);
				var sMessage = oResponseText.error.message.value;
				MessageBox.error(sMessage);
				return;
			});

			this._pTechObjDialog.then(function(oDialog) {
				oDialog.open();
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
			var aSelected = tbOrders.getSelectedContexts();

			if (aSelected.length === 0) {
				MessageBox.error(this._geti18nText("msgESelectItem"));
				return;
			}

			if (aSelected.length > 1) {
				MessageBox.error(this._geti18nText("msgEMultipleItems"));
				return;
			}

			var tbMatdoclines = this.byId("tbMatdoclines");
			var oObject = aSelected[0].getObject();
			var sGilines = oObject.Gilines;

			if (!sGilines) {
				MessageBox.error(this._geti18nText("msgENoData"));
				return;
			}

			var sOrderid = oObject.Ordno;
			var sPhase = oObject.Phase;
			var sMoveType = '001';
			var sProddate = oObject.Proddate;
			if (!sProddate) {
				sProddate = new Date();
			}

			var oMatdocitems = this._readMatdocitems(sOrderid, sPhase, sMoveType, sProddate, tbMatdoclines);

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

		onBPReceiptPress: function() {

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
			var aSelected = tbOrders.getSelectedContexts();

			if (aSelected.length === 0) {
				MessageBox.error(this._geti18nText("msgESelectItem"));
				return;
			}

			if (aSelected.length > 1) {
				MessageBox.error(this._geti18nText("msgEMultipleItems"));
				return;
			}

			var tbMatdoclines = this.byId("tbMatdoclines");
			var oObject = aSelected[0].getObject();
			var sOrderid = oObject.Ordno;
			var sPhase = oObject.Phase;
			var sMoveType = '002';
			var sProddate = oObject.Proddate;
			if (!sProddate) {
				sProddate = new Date();
			}

			var oMatdocitems = this._readMatdocitems(sOrderid, sPhase, sMoveType, sProddate, tbMatdoclines);

			var that = this;
			oMatdocitems.then(function(oResult) {

				if (oResult.results.length === 0) {
					MessageBox.error(that._geti18nText("msgENoData"));
					return;
				}

				that._pGoodsIssueDialog.then(function(oDialog) {
					oDialog.open();
				});

				var oMatdocModel = new JSONModel(oResult);
				tbMatdoclines.setModel(oMatdocModel, "oMatdocModel");

			});

			oMatdocitems.catch(function(oError) {
				var oResponseText = JSON.parse(oError.responseText);
				var sMessage = oResponseText.error.message.value;
				MessageBox.error(sMessage);
				return;
			});

		},

		onConfirmationPress: function() {

			var tbOrders = this.byId("tbOrders");
			var aSelected = tbOrders.getSelectedContexts();

			if (aSelected.length === 0) {
				MessageBox.error(this._geti18nText("msgESelectItem"));
				return;
			}

			if (aSelected.length > 1) {
				MessageBox.error(this._geti18nText("msgEMultipleItems"));
				return;
			}

			var oProdOrder = aSelected[0].getObject();

			if (oProdOrder.Yield === "" || oProdOrder.Yield === "0") {
				oProdOrder.Yield = "0.00";
			}

			if (oProdOrder.Scrap === "" || oProdOrder.Scrap === "0") {
				oProdOrder.Scrap = "0.00";
			}

			if (oProdOrder.Yield === "0.00") {
				MessageBox.error(this._geti18nText("msgEBlankYield"));
				return;
			}

			if (!oProdOrder.Proddate) {
				oProdOrder.Proddate = new Date();
			}

			if (oProdOrder.Gilines === 'X' && oProdOrder.Giprc < 100.00 && oProdOrder.Finalconf === true) {

				var that = this;
				sap.m.MessageBox.confirm(this._geti18nText("msgCGIIncomplete"), {
					title: "Confirm",
					onClose: function(sButton) {
						if (sButton === MessageBox.Action.OK) {
							that._postConfirmation(oProdOrder, tbOrders, oProdOrder);
						}
					}
				});
			} else {
				this._postConfirmation(oProdOrder, tbOrders, oProdOrder);
			}
		},

		handleBatchValueHelp: function(oEvent) {

			this._pinBatch = oEvent.getSource().getId();

			var oButton = oEvent.getSource();
			var oBindingContext = oButton.getBindingContext("oMatdocModel");
			var oBindingObject = oBindingContext.getObject();

			var oView = this.getView();
			if (!this._pBatchValueHelpDialog) {
				this._pBatchValueHelpDialog = Fragment.load({
					id: oView.getId(),
					name: "com.magenta_ProdConfirmation.view.BatchValueHelpDialog",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			var sMaterial = oBindingObject.Material;
			var sPlant = oBindingObject.Plant;
			var sStgeLoc = oBindingObject.StgeLoc;

			if (!sMaterial && !sPlant && !sStgeLoc) {
				return;
			}

			var oBatches = this._readBatches(sMaterial, sPlant, sStgeLoc, this.byId("BatchValueHelpDialog"));

			var that = this;
			oBatches.then(function(oResult) {
				var oBatchModel = new JSONModel(oResult);
				that._pBatchValueHelpDialog.then(function(oDialog) {
					oDialog.setModel(oBatchModel, "oBatchModel");
					oDialog.open();
				});
			});

			oBatches.catch(function(oError) {
				return;
			});

		},

		handleBatchSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter1 = new Filter("Batch", FilterOperator.Contains, sValue);
			var aFilter = new Filter([oFilter1]);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(aFilter);
		},

		handleBatchClose: function(oEvent) {

			var oItem = oEvent.getParameter("selectedItem");

			if (oItem) {
				var oContext = oItem.getBindingContext("oBatchModel");
				var oObject = oContext.getObject();
			}

			if (this._pinBatch && oObject) {
				var oInput = sap.ui.getCore().getElementById(this._pinBatch);
				oInput.setValue(oObject.Batch);
			}

		},

		onPostMatdoc: function() {

			var oTable = this.byId("tbMatdoclines");
			var aSelected = oTable.getSelectedContexts();

			if (aSelected.length === 0) {
				MessageBox.error(this._geti18nText("msgESelectItem"));
				return;
			}

			var aMatDocitems = [];
			var bQty = false;

			aSelected.forEach(function(oLine) {

				var oObj = oLine.getObject();

				if (!oObj.EntryQnt) {
					bQty = true;
				}

				aMatDocitems.push(oObj);
			});

			if (bQty) {
				MessageBox.error(this._geti18nText("msgEBlankQty"));
				return;
			}

			this._postMatDoc(aMatDocitems, oTable);
		},

		onWeighBridgePress: function(oEvent) {

			var oView = this.getView();

			var oButton = oEvent.getSource();
			var oBindingContext = oButton.getBindingContext("oMatdocModel");
			this._pGIPath = oBindingContext.getPath();
			var oBindingObject = oBindingContext.getObject();
			var sPlant = oBindingObject.Plant;

			if (!this._pWeighBridgeDialog) {
				this._pWeighBridgeDialog = Fragment.load({
					id: oView.getId(),
					name: "com.magenta_ProdConfirmation.view.WeighBridgeDialog",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			var WeighBridgeDialog = this.byId("WeighBridgeDialog");
			var selTerminal = this.byId("selTerminal");
			var oWeighBridge = this._readWeighBridge(sPlant, "", WeighBridgeDialog);

			oWeighBridge.then(function(oResult) {
				var oWeighBridgeModel = new JSONModel(oResult);
				selTerminal.setModel(oWeighBridgeModel, "oWeighBridgeModel");
			});

			oWeighBridge.catch(function(oError) {
				var oResponseText = JSON.parse(oError.responseText);
				var sMessage = oResponseText.error.message.value;
				MessageBox.error(sMessage);
				return;
			});

			this._pWeighBridgeDialog.then(function(oDialog) {
				oDialog.open();
			});
		},

		onGetWeight: function() {

			var selTerminal = this.byId("selTerminal");
			var oItem = selTerminal.getSelectedItem();

			if (!oItem) {
				MessageBox.error(this._geti18nText("msgESelectTerminal"));
				return;
			}

			var oBindingContext = oItem.getBindingContext("oWeighBridgeModel");
			var oBindingObject = oBindingContext.getObject();
			var tbMatdoclines = this.byId("tbMatdoclines");
			var oMatdocModel = tbMatdoclines.getModel("oMatdocModel");
			var oData = oMatdocModel.getProperty("/results");
			var iIndex = this._getIndexFromPath(this._pGIPath);
			oData[iIndex].EntryQnt = oBindingObject.Weight;
			oMatdocModel.setProperty("/results", oData);
			this.onCloseWeighBridgeDialog();
		},

		onSelectTechObj: function() {

			var selTechObj = this.byId("selTechObj");
			var oKey = selTechObj.getSelectedKey();
			if (!oKey) {
				MessageBox.error(this._geti18nText("msgESelectTechObj"));
				return;
			}

			var sTechObj = oKey;
			this.onCloseTechObjDialog();

			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var hashUrl = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "MaintenanceNotification",
					action: "create_simple"
				},
				params: {
					TechnicalObject: sTechObj,
					NotificationType: "ZC"
				}
			}));
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hashUrl
				}
			});

		},

		onPostScrap: function() {

			var inScrap = this.byId("inScrap");
			var sScrap = inScrap.getValue();
			if (!sScrap) {
				MessageBox.error(this._geti18nText("msgEBlankScrap"));
				return;
			}

			var selScrapRsn = this.byId("selScrapRsn");
			var oKey = selScrapRsn.getSelectedKey();
			if (!oKey) {
				MessageBox.error(this._geti18nText("msgEBlankScrapReason"));
				return;
			}

			var tbOrders = this.byId("tbOrders");
			var aSelected = tbOrders.getSelectedContexts();
			var oProdOrder = aSelected[0].getObject();

			oProdOrder.Yield = "0.00";
			oProdOrder.Scrap = sScrap;
			oProdOrder.Scraprsn = oKey;

			if (!oProdOrder.Proddate) {
				oProdOrder.Proddate = new Date();
			}

			this._postConfirmation(oProdOrder, tbOrders, oProdOrder);

			this.onCloseScrapDialog();

		},

		onPostCombOrd: function() {

			var CombOrdDialog = this.byId("CombOrdDialog");
			var tbOrders = this.byId("tbOrders");
			var aSelected = tbOrders.getSelectedContexts();
			var oCombOrdHead = aSelected[0].getObject();
			var tbCombOrdItems = this.byId("tbCombOrdItems");
			var oCombOrdItemModel = tbCombOrdItems.getModel("oCombOrdItemModel");
			var aCombOrdItems = oCombOrdItemModel.getProperty("/results/");

			var bQty = false;
			aCombOrdItems.forEach(function(oItem) {

				if (!oItem.Yield || oItem.Yield === "0.00" ) {
					bQty = true;
				}
			});

			if (bQty) {
				MessageBox.error(this._geti18nText("msgEBlankQty"));
				return;
			}

			this._postCombOrd(oCombOrdHead, aCombOrdItems, CombOrdDialog, tbOrders);

		},

		onMorePress: function(oEvent) {

			var oButton = oEvent.getSource();
			var oBindingContext = oButton.getBindingContext("oProdOrdModel");
			var oBindingObject = oBindingContext.getObject();

			var aProdOrd = [];
			aProdOrd.push(oBindingObject);
			var oProdOrdModel = new JSONModel(aProdOrd);

			var oView = this.getView();

			if (!this._pMoreInfoDialog) {
				this._pMoreInfoDialog = Fragment.load({
					id: oView.getId(),
					name: "com.magenta_ProdConfirmation.view.MoreInfoDialog",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this._pMoreInfoDialog.then(function(oDialog) {

				oDialog.setModel(oProdOrdModel, "oProdOrdModel");
				oDialog.bindElement({
					path: "/0",
					model: "oProdOrdModel"

				});

				oDialog.open();
			});

		},

		onCloseGoodsIssueDialog: function() {
			this._pGoodsIssueDialog.then(function(oDialog) {
				oDialog.close();
			});
		},

		onCloseMoreInfoDialog: function() {
			this._pMoreInfoDialog.then(function(oDialog) {
				oDialog.close();
			});
		},

		onCloseWeighBridgeDialog: function() {
			this._pWeighBridgeDialog.then(function(oDialog) {
				oDialog.close();
			});
		},

		onCloseTechObjDialog: function() {
			this._pTechObjDialog.then(function(oDialog) {
				oDialog.close();
			});
		},

		onCloseScrapDialog: function() {
			this._pScrapDialog.then(function(oDialog) {
				oDialog.close();
			});
		},

		onCloseCombOrdDialog: function() {
			this._pCombOrdDialog.then(function(oDialog) {
				oDialog.close();
			});
		},

		onRefresh: function() {

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

		}

	});

});