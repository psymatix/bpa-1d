var ssApp = require('./subsetsum.js');


function BinPacking(){ 


var App = this;
    
//initialize some defaults
App.bins = []; App.items = []; App.binCount = 0; App.binSize = 10; App.currentBin = -1; App.bpmethod = "worstFit";
App.unplacedItems = []; App.unplacedUnpackItems = []; App.flexibleBins = true; App.currentPhase = "pack"; 


var item = function(size){
    var i = {};
    i.size = parseInt(size);
    i.used = false;
    i.bin = null;
    i.unpackBin = null;
    i.packPosition = null;
    i.unpackPosition = null;
    i.misfit = false;
    i.unpackmisfit = false;
    return i;
};

var bin = function(id, size, capacityUsed){
    var b = {};
    b.id = id;
    b.size = parseInt(size);
    b.capacityUsed = capacityUsed ? parseInt(capacityUsed) : 0;
    b.open = true;
    b.items = [];
    b.position = null; // for time period in profile
    
    return b;
    
};

var copyBinGroup = function(originalRef, copyRef){
    
    // have to recreate bin recursively
    // originalRef and copyRef are arrays
     
                for(var c=0; c<originalRef.length; c++){ 
                    
                    var $b = originalRef[c],  b = bin($b.id,$b.size,$b.capacityUsed);
                    b.position = $b.position;
                    copyRef.push(b);        
                    }
      
                    
};







//Assumption is bins are packed before being unpacked


App.init = function(config){
    //config:{binCount, binSize, bins, items, method}
    //methods: nextFit, worstFit
    //items = 1d array of sizes
    
    App.config = config;
    App.binCount = config.binCount ? config.binCount : 0;
    App.binSize = config.binSize ? parseInt(config.binSize) : 10;
    App.bpmethod = config.bpmethod;
    App.flexibleBins = (typeof config.flexibleBins !== 'undefined') ? config.flexibleBins : App.flexibleBins;
	
	// if there are items
	
    if(typeof config.items !== 'undefined'){
        for(var k = 0; k < config.items.length ; k++){
            App.items.push( item( parseInt(config.items[k]) ) );
        }
        
    }
	
	//if bins are specified
	
	if(typeof config.bins !== 'undefined'){
            var $b, $cfgbins = config.bins; 
		for (var p in $cfgbins){
                   $b = App.addBin(App.bins); // first set of bins is charge bins
                   $b.position = p;
                   $b.capacityUsed = $cfgbins[p];
                   
                }
                
                App.currentBin = 0; // since there are bins reset to 0

                App.originalBins = []; 
                copyBinGroup(App.bins, App.originalBins);
                    
	}

	
    
    
    
};



App.addBin = function(binGroup){  
    App.binCount++; App.currentBin++;
    var count = binGroup.push( bin(App.currentBin, App.binSize) ); // push bin into end of array
    return binGroup[count-1]; //return last bin
};



App.binContent = function(binGroup){
    //reveal
   
  console.log("items:", App.config.items);
    
    
    for(var i = 0; i<binGroup.length; i++ ){
         //console.log("Bin %d: %j", App.bins[i].id, JSON.stringify(App.bins[i].items) );
         var $b = binGroup[i],
         binstr = "Bin " + $b.id + ": ";
         for(var j=0; j < $b.items.length; j++){
            var $i = $b.items[j];
            binstr += $i.size + ", "; 
         }
         
         console.log( binstr );
    }
    if(App.currentPhase === "pack"){

    console.log(App.unplacedItems);

    }else{
        console.log(App.unplacedUnpackItems);
    }
};


App.binSort = function(sorting, binGroup){
            //sort bins by increasing capacity used
            //first make a copy of the array
            // binGroup = array of bins
            
         
         var binGroupCopy = []; copyBinGroup(binGroup, binGroupCopy); 
        
      
        

            switch(sorting){
            case "emptiest":
                    binGroupCopy.sort(function(a,b){
                        return a.capacityUsed - b.capacityUsed;
                    });
            break;
            case "fullest":
                binGroupCopy.sort(function(a,b){
                        return b.capacityUsed - a.capacityUsed;
                    });
            break;         
                
            
            }
           
         var chosenBinId = binGroupCopy[0].id, cb;
           
                                for (var j=0; j<binGroup.length; j++){
                                     if(binGroup[j].id === chosenBinId){ 
                                        cb = binGroup[j];
                                        break; 
                                     }
                                }
    
        return cb; // only element
           
  
       
};

App.placeItem = function(item, bin, phase){
                
                switch(phase){
                    case "pack":
                        item.bin = bin.id;
                        item.packPosition = bin.position;
                        item.used = true;
                    break;
                   case "unpack":
                        item.unpackBin = bin.id; 
                        item.unpackPosition = bin.position;
                        item.unpacked = true;    
                    break;
                }
                
                bin.capacityUsed += item.size;
                bin.items.push( item );
                  if(App.currentPhase == "unpack"){
                        console.log("up bg",App.inverseBins); 
                    }
                
};


App.checkFit = function(bin, item){
   var fit =  parseInt(bin.size - bin.capacityUsed) > item.size ? true : false;
   return fit;
};

App.chooseCurrentBin = function(method, binGroup, item){
    
    var $cb; 
   
  
    //chosen bin to place item is where the contention is
                    switch(method){
                        case "nextFit":
                                $cb = binGroup[App.currentBin]; // current bin is increased updated after a new bin is added
                            break;
                        
                        case "worstFit":
                                if(App.currentPhase === "pack"){
                                    
                                 $cb = App.binSort("emptiest", binGroup); // current bin is chosen as the emptiest
                               
                                }else{
                                     
                            
                                // select eligible bins first based on order, 
                                // can only be unpacked into bins that come after it is packed
                            
                                var eligibleBins = binGroup.map(function(b,k){
                                    if( parseInt(b.position) >= parseInt(item.packPosition) ){
                                        return b;
                                    }
                                });
                              
                                var meb = App.binSort("emptiest", eligibleBins); // current bin is chosen as the emptiest, most eligible bin
                                $cb = App.BinById(meb.id, binGroup);   
                           
                             }
                                
                                
                            break;
                        
                    }
                   
                  return $cb;
 
    
    
};


App.handleMisfits = function(method, binGroup, $currItem, unplacedItemsArray){
    
    
                   
                                // system for filling up left over items here
                                // if it's worst fit and it doesn't fit in the emptiest then put in left overs
                                // if it's next fit then loop through bins in order until a fit is found

                                switch(method){
                                     case "worstFit":
                                         $currItem.misfit = true;
                                         unplacedItemsArray.push($currItem);   
                                         
                                         break;
                                     case "nextFit":
                                         
                                         for(var l=0; l<binGroup.length; l++){
                                             
                                             switch(App.currentPhase){
                                             case "pack":
                                                
                                                if(App.checkFit(binGroup[l], $currItem)){
                                                   App.placeItem($currItem, binGroup[l], App.currentPhase);  
                                                   break;
                                                }
                                                
                                             break;
                                             case "unpack":
                                                 if( (parseInt(binGroup[l].position) >= parseInt($currItem.packPosition)) && App.checkFit(binGroup[l], $currItem)){
                                                  //check if it is in the right position and it fits
                                                    App.placeItem($currItem, binGroup[l], App.currentPhase);  
                                                   break;
                                                 }
                                             break;
                                             
                                            }
                                         }
                                        // after loop  if the item isn't placed, put in unplaced
                                        
                                        
                                        
                                        
                                        if(App.currentPhase ===  "pack" && !$currItem.bin){
                                           
                                                   $currItem.misfit = true;
                                                   unplacedItemsArray.push($currItem);          
                                                }
                                          else if(App.currentPhase ===  "unpack" && !$currItem.unpackBin){
                                           
                                                   $currItem.unpackmisfit = true;
                                                   unplacedItemsArray.push($currItem);          
                                                }
                                        
                                        
                                        
                                        break;
                                         
                                     }// switch to handle unplaced items depending on method
                                                 
	
    
};


App.binPackingFunction = function(method, binGroup){
    
    //METHODS: nextFit, worstFit...
    //binGroup = App.bins, the charging bins || App.inverseBins, the discharging bins
    
    unplacedItemsArray = (App.currentPhase === "pack") ?  App.unplacedItems : App.unplacedUnpackItems;
       
 
     for(var i=0; i<App.items.length; i++){
        if(App.currentPhase == "unpack"){console.log(App.items[i].size);}
             var $cb, $currItem = App.items[i];
          
             //1. CHOOSE CURRENT BIN WHICH THIS ITEM CAN BE DROPPED IN 
             
             if(binGroup.length < 1){
                    //first bin -- all methods need this
                    $cb = App.addBin(binGroup);
                }else{
                    
               $cb = App.chooseCurrentBin(method, binGroup, $currItem);
               
            }
            
        
     
            //2. CHECK IF THE ITEM FITS IN THE BIN, IF NOT MOVE IT TO ANOTHER
            
            if( App.checkFit($cb, $currItem) && $cb.open ){
                
                App.placeItem($currItem, $cb, App.currentPhase);   
               
				
             }else{
                 
                //add a new Bin and close the currentOne for some scenarios
                
                
                 var closeBinMethods = ["nextFit"];
                
                 if(App.flexibleBins){
                     
                        $cb.open = (closeBinMethods.indexOf(App.bpmethod) > -1) ? false : true;
                        var $nextBin = App.addBin(binGroup);
                        App.placeItem($currItem, $nextBin, App.currentPhase);        

                 }else{
                     
                     App.handleMisfits(method, binGroup, $currItem, unplacedItemsArray);
                     
                }// if flexible bins
				   
				   
             } // if it fits in bin or not
          
     
          
        }// items loop


    
}; // bin packing ends


App.unpackInit = function(){
    
    //create new set of bins
    // this is assumed to run after packing function

    App.inverseBins = []; // have to recreate bin recursively
    copyBinGroup(App.originalBins, App.inverseBins);
    
    // do the bin inversion
    
    App.inverseBins.forEach(function(bin,i,a){
        bin.capacityUsed = bin.size - bin.capacityUsed;
    });


    App.currentBin = 0;// reset current bin
    App.currentPhase = "unpack";
    
    
};

App.BinById = function(id,binGroup){
    var bin;
    for(var b=0; b<binGroup.length; b++){
        if(binGroup[b].id === id){
            bin = binGroup[b];
            break;
        }
    }
    return bin;
    
};



}


console.reset = function () {
    return process.stdout.write('\033c');
}; 


var $ss = new ssApp();
var candidates = $ss.init(6, 1, 18);

console.log(candidates);

var $bp = new BinPacking();

//var it =   [4,8,5,1,7,6,1,4,2,2];

var it = candidates[0].combination.slice();
var b = {"0000":0,"0100":5, "0200": 0, "0300": 9, "0400": 0};


cfg = {
        "binCount": 0,
        "binSize": 10,
        "bins": b,
        "items": it,
        "bpmethod": "worstFit",
	"flexibleBins": false
    }; 


$bp.init(cfg);

//packing phase
$bp.binPackingFunction(cfg.bpmethod, $bp.bins);
$bp.binContent($bp.bins);

//unpacking phase
$bp.unpackInit();


$bp.binPackingFunction(cfg.bpmethod, $bp.inverseBins);
/*$bp.binContent($bp.inverseBins);
*/

console.log("Original Bins", $bp.originalBins);
console.log("Inverse Bins", $bp.inverseBins);
console.log("Packed Bins", $bp.bins);


// stack those bins using the items and their positions to provide the discharge
// compute how much energy has been saved and new profile