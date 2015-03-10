var ssApp = require('./subsetsum.js');


function BinPacking(){ 


var App = this;
    
//initialize some defaults
App.bins = []; App.items = []; App.binCount = 0; App.binSize = 10; App.currentBin = -1; App.bpmethod = "worstFit";
App.unplacedItems = []; App.unplacedUnpackItems = []; App.flexibleBins = true; App.currentPhase = "pack"; 

//Assumption is bins are packed before being unpacked


App.init = function(config){
    //config:{binCount, binSize, bins, items, method}
    //methods: nextFit, worstFit
    //items = 1d array of sizes
    
    App.config = config;
    App.binCount = config.binCount ? config.binCount : 0;
    App.binSize = config.binSize ? config.binSize : 10;
    App.bpmethod = config.bpmethod;
    App.flexibleBins = (typeof config.flexibleBins !== 'undefined') ? config.flexibleBins : App.flexibleBins;
	
	// if there are items
	
    if(typeof config.items !== 'undefined'){
        for(k = 0; k < config.items.length ; k++){
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
	}
	
    
    
    
};

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

App.addBin = function(binGroup){  
    App.binCount++; App.currentBin++;
    var count = binGroup.push( bin(App.currentBin, App.binSize) ); // push bin into end of array
    return binGroup[count-1]; //return last bin
};



App.binContent = function(){
    //reveal
   
  console.log("items:", App.config.items);
    
    
    for(i = 0; i<App.bins.length; i++ ){
         //console.log("Bin %d: %j", App.bins[i].id, JSON.stringify(App.bins[i].items) );
         var $b = App.bins[i],
         binstr = "Bin " + $b.id + ": ";
         for(j=0; j < $b.items.length; j++){
            var $i = $b.items[j];
            binstr += $i.size + ", "; 
         }
         
         console.log( binstr );
    }
    
    console.log(App.unplacedItems);

};


App.binSort = function(sorting, binGroup){
            //sort bins by increasing capacity used
            //first make a copy of the array
            // binGroup = array of bins
            

         var bins = binGroup.slice();
         
            switch(sorting){
            case "emptiest":
                    bins.sort(function(a,b){
                        return a.capacityUsed - b.capacityUsed;
                    });
            break;
            case "fullest":
                bins.sort(function(a,b){
                        return b.capacityUsed - a.capacityUsed;
                    });
            break;         
                
            
            }
            
         var emptiestBinId =  bins[0].id;
         var cbArr = binGroup.filter(function(elem){ 
                                    if(elem.id === emptiestBinId){ return true; }
                                });
        return cbArr[0]; // only element
        
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
                
};


App.checkFit = function(bin, item){
   var fit =  parseInt(bin.size - bin.capacityUsed) > item.size ? true : false;
   return fit;
};

App.binPackingFunction = function(method, binGroup){
    
    //METHODS: nextFit, worstFit...
    //binGroup = App.bins, the charging bins || App.inverseBins, the discharging bins
    
    unplacedItemsArray = (App.currentPhase === "pack") ?  App.unplacedItems : App.unplacedUnpackItems;
    
     for(i=0; i<App.items.length; i++){
             
             var $cb, $currItem = App.items[i];
             if(binGroup.length < 1){
                    //first bin -- all methods need this
                    $cb = App.addBin(binGroup);
                }else{
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
                                    if( parseInt(b.position) >= parseInt(App.items[i].packPosition) ){
                                        return b;
                                    }
                                });
                              
                                var meb = App.binSort("emptiest", eligibleBins); // current bin is chosen as the emptiest, most eligible bin
                                $cb = App.BinById(meb.id, binGroup);   
                           
                             }
                                
                                
                            break;
                        
                    }
              
                }
                   
            
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
                                        
                                // system for filling up left over items here
                                // if it's worst fit and it doesn't fit in the emptiest then put in left overs
                                // if it's next fit then loop through bins in order until a fit is found

                                switch(method){
                                     case "worstFit":
                                         $currItem.misfit = true;
                                         unplacedItemsArray.push($currItem);   
                                         
                                         break;
                                     case "nextFit":
                                         
                                         for(i=0; i<binGroup.length; i++){
                                             
                                             switch(App.currentPhase){
                                             case "pack":
                                                
                                                if(App.checkFit(binGroup[i], $currItem)){
                                                   App.placeItem($currItem, binGroup[i], App.currentPhase);  
                                                   break;
                                                }
                                                
                                             break;
                                             case "unpack":
                                                 if( (parseInt(binGroup[i].position) >= parseInt($currItem.packPosition)) && App.checkFit(binGroup[i], $currItem)){
                                                  //check if it is in the right position and it fits
                                                    App.placeItem($currItem, binGroup[i], App.currentPhase);  
                                                   break;
                                                 }
                                             break;
                                             
                                            }
                                         }
                                        
                                        // after loop  if the item isn't placed, put in unplaced
                                        
                                        switch(App.currentPhase){
                                            
                                            case "pack":
                                                if(!$currItem.bin){
                                                   $currItem.misfit = true;
                                                   unplacedItemsArray.push($currItem);          
                                                }
                                            break;
                                            case "unpack":
                                                 if(!$currItem.unpackBin){
                                                   $currItem.unpackmisfit = true;
                                                   unplacedItemsArray.push($currItem);          
                                                }
                                            break;
                                                
                                        }// switch to place unplaced items in correct array depending on phase
                                        
                                        break;
                                         
                                     }// switch to handle unplaced items depending on method
                                                 
						
				   
				   }// if flexible bins
				   
				   
                } // if it fits in bin or not

        }// items loop

    
    
}; // bin packing ends


App.unpackInit = function(){
    
    //create new set of bins
    App.inverseBins = App.bins.slice();
    
    App.inverseBins.forEach(function(bin, index, array){
        bin.capacityUsed = App.binSize - bin.capacityUsed; //perform inversion
        bin.items = []; //reset items array
    });
    
    App.currentBin = 0;// reset current bin
    App.currentPhase = "unpack";
    
    
};

App.BinById = function(id,binGroup){
    var bin;
    for(i=0; i<binGroup.length; i++){
        if(binGroup[i].id === id){
            bin = binGroup[i];
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

$bp.binPackingFunction(cfg.bpmethod, $bp.bins);
$bp.binContent();
$bp.unpackInit();
console.log($bp.inverseBins);
// setup unpacking algorithm
// create inverseBins group
// stack those bins using the items and their positions to provide the discharge
// compute how much energy has been saved and new profile