var ssApp = require('./subsetsum.js');


function BinPacking(){ 

//var App = App || {};

var App = this;
    
//initialize
App.bins = [], App.binCount = 0, App.binSize = 10, App.currentBin = -1;



var item = function(size){
    var i = {};
    i.size = parseInt(size);
    i.used = false;
    i.position = null;
    return i;
};

var bin = function(id, size, capacityUsed){
    var b = {};
    b.id = id;
    b.size = parseInt(size);
    b.capacityUsed = capacityUsed ? parseInt(capacityUsed) : 0;
    b.open = true;
    b.items = [];
    return b;
    
};

App.addBin = function(){  
    App.binCount++; App.currentBin++;
    var count = App.bins.push( bin(App.currentBin, App.binSize) ); // push bin into end of array
    return App.bins[count-1]; //return last bin
};

// items to go in bins
var items = [
    item(4), 
    item(8),
    item(5),
    item(1),
    item(7),
    item(6), 
    item(1),
    item(4), 
    item(2), 
    item(2)
];


App.binContent = function(){
    //reveal 

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

};


App.binSort = function(sorting){
            //sort bins by increasing capacity used
            //first make a copy of the array
            
         var bins = App.bins.slice();
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
         var cbArr = App.bins.filter(function(elem){ 
                                    if(elem.id === emptiestBinId){ return true; }
                                });
        return cbArr[0]; // only element
        
};

App.placeItem = function(item, bin){
     
                item.position = bin.id; 
                item.used = true;
                bin.capacityUsed += item.size;
                bin.items.push( item );
                
};

App.binPackingFunction = function(method){
    
    //METHODS: nextFit, worstFit
    
     for(i=0; i<items.length; i++){
             
             var $cb, $currItem = items[i];
             if(App.bins.length < 1){
                    //first bin -- all methods need this
                    $cb = App.addBin();
                }else{
                    //chosen bin to place item is where the contention is
                    switch(method){
                        case "nextFit":
                                $cb = App.bins[App.currentBin];
                            break;
                        
                        case "worstFit":
                                $cb = App.binSort("emptiest");
                            break;
                        
                    }
              
                }
                   
            fit = parseInt($cb.size - $cb.capacityUsed) > $currItem.size ? true : false;    
         
            
            if( fit && $cb.open ){
                App.placeItem($currItem, $cb);                
            }else{
                //add a new Bin and close the currentOne for some scenarios
                 var closeBinMethods = ["nextFit"];
                 $cb.open = (closeBinMethods.indexOf(method) > -1) ? false : true;
                 
                 var $nextBin = App.addBin();
                 App.placeItem($currItem, $nextBin);        
                   
                } // if it fits in bin or not

        }// items loop

    
    
};



}


console.reset = function () {
    return process.stdout.write('\033c');
}; 


var $ss = new ssApp();
var candidates = $ss.init(6, 1, 18);

console.log(candidates);

var $bp = new BinPacking();

$bp.binPackingFunction("worstFit");
$bp.binContent();


//console.log(typeof ssApp);
//ssApp.init();