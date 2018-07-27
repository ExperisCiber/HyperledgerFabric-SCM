/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/**
* A product purchase by a consumer
* @param {org.acme.shipping.perishable.PurchaseProducts} PurchaseProducts - the PurchaseProducts transaction
* @transaction
*/
function purchaseProducts(PurchaseProducts){
  // Step 1: Create Products asset
  var factory = getFactory();
  var NS = 'org.acme.shipping.perishable';
  var products = factory.newResource(NS, 'Products', PurchaseProducts.productId);
  products.quantity = PurchaseProducts.quantity;
  products.consumer = PurchaseProducts.consumer;
  products.batch = PurchaseProducts.batch;
  
  // Step 2: Update batch asset
  var batch = PurchaseProducts.batch;
  batch.soldQuantity += PurchaseProducts.quantity;
  
  // Step 3: Update balances  
  var unitPrice = batch.productionLot.contract.unitPrice;
  var total = unitPrice * PurchaseProducts.quantity;
  
  var consumer = PurchaseProducts.consumer;
  consumer.accountBalance -= total;
  var supermarket = batch.supermarket;
  supermarket.accountBalance += total;
  
  return getAssetRegistry(NS + '.Products').then(function(productsRegistry) {
  	// add the product
  	return productsRegistry.addAll([products]);
  }).then(function() {
 	return getAssetRegistry(NS + '.Batch');
  }).then(function(batchRegistry) {
  	// Update the batch
    return batchRegistry.update(batch);
  }).then(function() {
 	return getParticipantRegistry(NS + '.Consumer');
  }).then(function(participantRegistry) {
  	// Update the consumer
    return participantRegistry.update(consumer);
  }).then(function() {
 	return getParticipantRegistry(NS + '.Supermarket');
  }).then(function(participantRegistry) {
  	// Update the supermarket
    return participantRegistry.update(supermarket);
  })
}
 
/**
* Set up function
* @param {org.acme.shipping.perishable.setup} setup - the setup transaction
* @transaction
*/
function setup(setup) {
  
    var factory = getFactory();
    var NS = 'org.acme.shipping.perishable';
 
    // create the grower
    var grower = factory.newResource(NS, 'Grower', 'grower@email.com');
    var growerAddress = factory.newConcept(NS, 'Address');
    growerAddress.country = 'USA';
    grower.address = growerAddress;
    grower.accountBalance = 1000;
 
    // create the importer
    var importer = factory.newResource(NS, 'Importer', 'importer@email.com');
    var importerAddress = factory.newConcept(NS, 'Address');
    importerAddress.country = 'UK';
    importer.address = importerAddress;
    importer.accountBalance = 1000;
 
    // create the shipper
    var shipper = factory.newResource(NS, 'Shipper', 'shipper@email.com');
    var shipperAddress = factory.newConcept(NS, 'Address');
    shipperAddress.country = 'Panama';
    shipper.address = shipperAddress;
    shipper.accountBalance = 1000;
  
  // create the supermarket
    var supermarket = factory.newResource(NS, 'Supermarket', 'supermarket@email.com');
    var supermarketAddress = factory.newConcept(NS, 'Address');
    supermarketAddress.country = 'Holland';
    supermarket.address = supermarketAddress;
    supermarket.accountBalance = 1000;
  
  // create the quality inspector
    var qualityInspector = factory.newResource(NS, 'QualityInspector', 'qualityinspector@email.com');
    var qualityInspectorAddress = factory.newConcept(NS, 'Address');
    qualityInspectorAddress.country = 'Holland';
    qualityInspector.address = qualityInspectorAddress;
    qualityInspector.accountBalance = 1000;
  
  // create the customs
    var customs = factory.newResource(NS, 'Customs', 'customs@email.com');
    var customsAddress = factory.newConcept(NS, 'Address');
    customsAddress.country = 'Holland';
    customs.address = customsAddress;
    customs.accountBalance = 1000;
 
  // create the consumer
  var consumer = factory.newResource(NS, 'Consumer', 'consumer@email.com');
    var consumerAddress = factory.newConcept(NS, 'Address');
    consumerAddress.country = 'Holland';
    consumer.address = consumerAddress;
    consumer.accountBalance = 1000;
  
    // create a contract
    var contract = factory.newResource(NS, 'Contract', 'CON_001');
    contract.grower = factory.newRelationship(NS, 'Grower', 'grower@email.com');
    contract.importer = factory.newRelationship(NS, 'Importer', 'importer@email.com');
    contract.shipper = factory.newRelationship(NS, 'Shipper', 'shipper@email.com');
    var date = new Date();
  	date.setDate(date.getDate() + 1);
    contract.arrivalDateTime = date;
    contract.unitPrice = 0.5;
    contract.minTemperature = 2;
    contract.maxTemperature = 10;
    contract.minPenaltyFactor = 0.2; // we reduce the price by XX cents for every degree below the min temp
    contract.maxPenaltyFactor = 0.1;// we reduce the price by XX cents for every degree above the max temp
  
  // create a production lot
    var productionLot = factory.newResource(NS, 'ProductionLot', 'LOT_001');
    productionLot.grower = factory.newRelationship(NS, 'Grower', 'grower@email.com');
    productionLot.productType = 'BANANAS';
  	var expDate = new Date();
  	expDate.setDate(expDate.getDate() + 10);
  	productionLot.expirationDate = expDate;
    productionLot.quantity = 1000;
    productionLot.contract = factory.newRelationship(NS, 'Contract', 'CON_001');
  	productionLot.shipmentStatus = 'CREATED';
 
    return getParticipantRegistry(NS + '.Grower')
        .then(function (growerRegistry) {
            // add the growers
            return growerRegistry.addAll([grower]);
        })
        .then(function() {
            return getParticipantRegistry(NS + '.Importer');
        })
        .then(function(importerRegistry) {
            // add the importers
            return importerRegistry.addAll([importer]);
        })
        .then(function() {
            return getParticipantRegistry(NS + '.Shipper');
        })
        .then(function(shipperRegistry) {
            // add the shippers
            return shipperRegistry.addAll([shipper]);
        })
  .then(function() {
      return getParticipantRegistry(NS + '.Supermarket');
    })
  .then(function(supermarketRegistry) {
      // add the supermarkets
    return supermarketRegistry.addAll([supermarket]);
    })
  .then(function() {
      return getParticipantRegistry(NS + '.QualityInspector');
    })
  .then(function(qualityInspectorRegistry) {
      // add the quality inspectors
    return qualityInspectorRegistry.addAll([qualityInspector]);
    })
    .then(function() {
      return getParticipantRegistry(NS + '.Consumer');
    })
  .then(function(consumerRegistry) {
      // add the consumer
    return consumerRegistry.addAll([consumer]);
    })
  .then(function() {
      return getParticipantRegistry(NS + '.Customs');
    })
  .then(function(customsRegistry) {
      // add the customs
    return customsRegistry.addAll([customs]);
    })
  .then(function() { 
    return getAssetRegistry(NS + '.Contract')
    })
      .then(function(contractRegistry) {
            // add the contract
            return contractRegistry.addAll([contract]);
        })
        .then(function() {
    return getAssetRegistry(NS + '.ProductionLot')
    })
        .then(function(productionLotRegistry) {
            // add the production lot
            return productionLotRegistry.addAll([productionLot]);
        });
}
 
 
/**
* A quality certificate was granted for the production lot
* @param {org.acme.shipping.perishable.CertificateGranted} CertificateGranted - the CertificateGranted transaction
* @transaction
*/
function grantCertificate(CertificateGranted) {
 
  // Update productionLot with CertificateGranted. If CertificateGranted contains a transaction within a productionLot
    // this is proof that the CertificateGranted transaction was actually executed (so we do not need a boolean value)
    // CertificateGranted contains 2 properties
  //   transactionId
    //   timestamp
  
    var productionLot = CertificateGranted.productionLot;
    productionLot.certificateGranted = [CertificateGranted];
    return getAssetRegistry('org.acme.shipping.perishable.ProductionLot')
        .then(function (productionLotRegistry) {
            // add the granted certificate to the production lot
            return productionLotRegistry.update(productionLot);
   
        }); 
}
 
/**
* A custom clearance was granted for the production lot
* @param {org.acme.shipping.perishable.ClearanceGranted} ClearanceGranted - the ClearanceGranted transaction
* @transaction
*/
function grantClearance(ClearanceGranted) {
  
    // Update productionLot with ClearanceGranted. If ClearanceGranted contains a transaction within a productionLot
    // this is proof that the ClearanceGranted transaction was actually executed (so we do not need a boolean value)
    // ClearanceGranted contains 2 properties
  //   transactionId
    //   timestamp
 
    var productionLot = ClearanceGranted.productionLot;
    productionLot.clearanceGranted = [ClearanceGranted];
  
    return getAssetRegistry('org.acme.shipping.perishable.ProductionLot')
        .then(function (productionLotRegistry) {
            // add the granted certificate to the production lot
            return productionLotRegistry.update(productionLot);
        });
}
 
/**
* A production lot was issued by the shipper
* @param {org.acme.shipping.perishable.ShipmentIssued} ShipmentIssued - the ShipmentIssued transaction
* @transaction
*/
function issueShipment(ShipmentIssued){
  var productionLot = ShipmentIssued.productionLot;
  productionLot.shipmentStatus = 'IN_TRANSIT';
  return getAssetRegistry('org.acme.shipping.perishable.ProductionLot')
        .then(function (productionLotRegistry) {
            return productionLotRegistry.update(productionLot);
        });  
}
 
/**
* A production lot was received by the importer
* @param {org.acme.shipping.perishable.ShipmentReceived} ShipmentReceived - the ShipmentReceived transaction
* @transaction
*/
function receiveShipment(ShipmentReceived){
  // Step 1: Update production lot owner (importer) and status
  var productionLot = ShipmentReceived.productionLot;
  productionLot.importer = ShipmentReceived.importer;
  productionLot.shipmentStatus = 'ARRIVED';
  
  
  
  //   total we can determine by doing ( productionLot.quantity * productionLot.contract.unitPrice )
  var total = productionLot.quantity * productionLot.contract.unitPrice;
  // 100 * 0,5 = 50
  // if the shipment did not arrive on time the payout is zero
  if (ShipmentReceived.timestamp > productionLot.contract.arrivalDateTime) {
        total = 0;
        console.log('Late shipment');
    } else {
        // find the lowest temperature reading
        if (productionLot.temperatureReadings) {
            // sort the temperatureReadings by centigrade
            productionLot.temperatureReadings.sort(function (a, b) {
                return (a.centigrade - b.centigrade);
            });
            var lowestReading = productionLot.temperatureReadings[0];
            var highestReading = productionLot.temperatureReadings[productionLot.temperatureReadings.length - 1];
            var penalty = 0;
            console.log('Lowest temp reading: ' + lowestReading.centigrade);
            console.log('Highest temp reading: ' + highestReading.centigrade);
 
            // does the lowest temperature violate the contract?
            if (lowestReading.centigrade < productionLot.contract.minTemperature) {
                penalty += (productionLot.contract.minTemperature - lowestReading.centigrade) * productionLot.contract.minPenaltyFactor;
                console.log('Min temp penalty: ' + penalty);
            }
 
            // does the highest temperature violate the contract?
            if (highestReading.centigrade > productionLot.contract.maxTemperature) {
                penalty += (highestReading.centigrade - productionLot.contract.maxTemperature) * productionLot.contract.maxPenaltyFactor;
              // (13 - 10) * 0,1 = 0,3
                console.log('Max temp penalty: ' + penalty);
            }
 
            // apply any penalities
            total -= (penalty * productionLot.quantity);
          // 50 - (0,3 * 100) = 20
 
            if (total < 0) {
                total = 0;
            }
        }
    }
  
  // Step 2: Update importer balance with minus productionLot total 
  productionLot.importer.accountBalance -= total;
  // Step 3: Update grower balance with plus productionLot total
  productionLot.grower.accountBalance += total;
  
  // Step 4: execute changes
  // Only synchronous processing is supported, so when we are working with promises,
  // we have to nest the promises to make the processing synchronous..
    return getAssetRegistry('org.acme.shipping.perishable.ProductionLot')
        .then(function (productionLotRegistry) {
      // update the production lot importer & status
            return productionLotRegistry.update(productionLot);
        })
      .then(function(){
    return getParticipantRegistry('org.acme.shipping.perishable.Importer')
        .then(function (importerRegistry) {
        // update the importer's balance
            return importerRegistry.update(productionLot.importer);
         })
         .then(function() {
            return getParticipantRegistry('org.acme.shipping.perishable.Grower')
         .then(function (growerRegistry) {
            // update the grower's balance
            return growerRegistry.update(productionLot.grower);
         })
       })
    });  
}
 
 
/**
* A contract is created
* @param {org.acme.shipping.perishable.CreateContract} CreateContract - the CreateContract transaction
* @transaction
*/
function createContract(CreateContract) {
  var factory = getFactory();
  var NS = 'org.acme.shipping.perishable';
  var contract = factory.newResource(NS, 'Contract', CreateContract.contractId);
  contract.grower = factory.newRelationship(NS, 'Grower', CreateContract.grower);
  contract.importer = factory.newRelationship(NS, 'Importer', CreateContract.importer);
  contract.shipper = factory.newRelationship(NS, 'Shipper', CreateContract.shipper);
  contract.arrivalDateTime = CreateContract.arrivalDateTime;
  contract.unitPrice = CreateContract.unitPrice;
  contract.minTemperature = CreateContract.minTemperature;
  contract.maxTemperature = CreateContract.maxTemperature;
  contract.minPenaltyFactor = CreateContract.minPenaltyFactor; // we reduce the price by XX cents for every degree below the min temp
  contract.maxPenaltyFactor = CreateContract.maxPenaltyFactor;// we reduce the price by XX cents for every degree above the max temp
  
  return getAssetRegistry(NS + '.Contract')
        .then(function(contractRegistry) {
            // add the contract
            return contractRegistry.addAll([contract]);
        });
}
 
/**
* A production lot is created
* @param {org.acme.shipping.perishable.CreateProductionLot} CreateProductionLot - the CreateProductionLot transaction
* @transaction
*/
function createProductionLot(CreateProductionLot) {
  var factory = getFactory();
  var NS = 'org.acme.shipping.perishable';
  var productionLot = factory.newResource(NS, 'ProductionLot', CreateProductionLot.productionLotId);
  productionLot.grower = factory.newRelationship(NS, 'Grower', CreateProductionLot.grower);
  productionLot.productType = CreateProductionLot.productType;
  productionLot.expirationDate = CreateProductionLot.expirationDate;
  productionLot.quantity = CreateProductionLot.quantity;
  productionLot.contract = factory.newRelationship(NS, 'Contract', CreateProductionLot.contract);
  productionLot.shipmentStatus = 'CREATED';
 
  return getAssetRegistry(NS + '.ProductionLot')
        .then(function(productionLotRegistry) {
            // add the production lot
            return productionLotRegistry.addAll([productionLot]);
        });
}
 
/**
* A batch is created based on a productionLot
* @param {org.acme.shipping.perishable.CreateBatch} CreateBatch - the CreateBatch transaction
* @transaction
*/
function createBatch(CreateBatch) {
  // Step 1: Lower productionLot quantity by batch quantity
  var productionLot = CreateBatch.productionLot;
  productionLot.quantity -= CreateBatch.quantity;
  
  // Step 2: Create batch
  var factory = getFactory();
  var NS = 'org.acme.shipping.perishable';
  var batch = factory.newResource(NS, 'Batch', CreateBatch.batchId);
  batch.quantity = CreateBatch.quantity;
  batch.soldQuantity = CreateBatch.soldQuantity;
  batch.productionLot = productionLot;
  
  return getAssetRegistry('org.acme.shipping.perishable.ProductionLot')
    .then(function (productionLotRegistry) {
      // add the granted certificate to the production lot
      return productionLotRegistry.update(productionLot);
    })
    .then(function() {
    return getAssetRegistry(NS + '.Batch')
    .then(function(batchRegistry) {
      // add the batch
      return batchRegistry.addAll([batch]);
    })
  });
  
}
 
/**
* A batch is purchased by a supermarket
* @param {org.acme.shipping.perishable.PurchaseBatch} PurchaseBatch - the PurchaseBatch transaction
* @transaction
*/
function purchaseBatch(PurchaseBatch){
  // Step 1: Update batch owner (supermarket)
  var batch = PurchaseBatch.batch;
  batch.supermarket = PurchaseBatch.supermarket;
  
  // Step 2: Update importer balance with plus batch total
  var total = batch.productionLot.contract.unitPrice * batch.quantity;
  batch.productionLot.importer.accountBalance += total
  
  // Step 3: Update supermarket balance with minus batch total
  batch.supermarket.accountBalance -= total
  
  return getAssetRegistry('org.acme.shipping.perishable.Batch')
    .then(function (batchRegistry) {
        // add the granted certificate to the production lot
        return batchRegistry.update(batch);
    })
    .then(function() {
    return getParticipantRegistry('org.acme.shipping.perishable.Importer')
    .then(function (importerRegistry) {
          // update the importer's balance
          return importerRegistry.update(batch.productionLot.importer);
    })
    .then(function() {
        return getParticipantRegistry('org.acme.shipping.perishable.Supermarket')
    .then(function (supermarketRegistry) {
      // update the importer's balance
      return supermarketRegistry.update(batch.supermarket);
    })
   })
  });
 
}
 
/**
* A temperature reading has been received for a shipment
* @param {org.acme.shipping.perishable.TemperatureReading} temperatureReading - the TemperatureReading transaction
* @transaction
*/
function temperatureReading(temperatureReading) {
 
    var productionLot = temperatureReading.productionLot;
    if (productionLot.temperatureReadings) {
        productionLot.temperatureReadings.push(temperatureReading);
    } else {
        productionLot.temperatureReadings = [temperatureReading];
    }
 
    return getAssetRegistry('org.acme.shipping.perishable.ProductionLot')
        .then(function (productionLotRegistry) {
            // add the temp reading to the shipment
            return productionLotRegistry.update(productionLot);
        });
}
