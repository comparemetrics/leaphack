// ==UserScript==
// @name        Leap Motion Reddit Browsing
// @namespace   leapgamer
// @description Lets you surf reddit with the Leap Motion Device.
// @include     http://*
// @version     1
// @require     http://code.jquery.com/jquery-latest.min.js
// @require     http://leapgamer.com/inc/leap.jquery.js 
// @grant       none
// ==/UserScript==

var onFrame = function() {
    var gestureSpeed = 1000; 
    var bottom = 200;
    var top = 400;
    var scrollSpeed = 0.05;
    var height = $(window).height();
    var range = top-bottom;
    var scrollHeight = $(document).scrollTop();
    
    function scrollPage() {
        //scroll the page up and down  
        if(fingerY < bottom) {
           var speed = Math.round(scrollSpeed*(bottom-fingerY));
           window.scrollBy(0,speed);
           //$("#console").append("<br />Scroll Speed: "+speed);  
        }
        if(fingerY > top) {
           window.scrollBy(0,-1*scrollSpeed*(fingerY-top));
        }
    }
           
    //on reddit control
    if(document.URL.indexOf("reddit.com") !== -1 && document.URL.indexOf("/comments/") == -1) { 
        if($("#leapcontrol").attr("checked") == "checked") {    
            if(window.mode == 1) {
               if(scrollHeight > 64) {
                  var visibleEntries = Math.round((height-64)/60)-3; 
               } else {
                  var visibleEntries = Math.round(height/60)-3;   
               }
                                                  
               if(window.leapData.numPointables > 0) {

                   var fingerY = window.leapData.pointables[0].tipPosition[1];
                   var fingerX = window.leapData.pointables[0].tipVelocity[0];    
                   var topEntry = Math.round((scrollHeight-64)/60);   
                   if(topEntry < 1) topEntry = 1;
                   var activeEntry = visibleEntries-(Math.round((fingerY-range)*visibleEntries/range))+topEntry; 
                   
                   if(activeEntry < 1) activeEntry = 1;
                   if(activeEntry > window.entryNum) activeEntry = window.entryNum-1;  
                   var selectionHeight = 64 + (60*activeEntry);    
          
                   $.each(window.entries, function(key, ent) {
                       ent.css("border","none"); 
                   }); 
                   window.entries[activeEntry].css("border","2px solid black"); 
           
                   $("#console").text("Active Entry: " + activeEntry);
                   $("#console").append("<br />Selection Height: "+selectionHeight + " | Window Height: "+height+"<br />Fingy Y: "+fingerY+"<br/>Visible Entries: "+visibleEntries+"<br/>Top Entry: "+topEntry);
                   
                   scrollPage();
                   
                   //open window
                   if(fingerX > gestureSpeed && window.leapData.pointables[0].tipPosition[0] > 0) {
                       window.mode = 2; 
                       window.open(window.entries[activeEntry].find("a.title").attr("href"), '_blank');
                       window.focus();
                   }
               } 
            } else {
                //close window
                if(window.leapData.numPointables>0) {    
                    var fingerX = window.leapData.pointables[0].tipVelocity[0];
                    if(fingerX < (-1*gestureSpeed) && window.leapData.pointables[0].tipPosition[0] < 0) {
                        window.mode = 1;
                    }   
                }
            }
        }
    } else { 
        //off reddit control
        if(window.leapData.numPointables>0) {
            var fingerY = window.leapData.pointables[0].tipPosition[1];  
            var fingerX = window.leapData.pointables[0].tipVelocity[0];
            //close window
            if(fingerX < (-1*gestureSpeed) && window.leapData.pointables[0].tipPosition[0] < 0) {  
                window.close();
            }  
            scrollPage();   
        } 
    }
    
};

var onConnect = function () {
    window.entries = [];
    window.docHeight = $(document).height();
    var i = 0;
    $(".thing.link").each(function(key, entry) {
        if($(this).css("display") != "none") {
            window.entries[i] = $(this);   
            i++;
        } 
    });
    window.entryNum = window.entries.length-1;
    window.mode = 1;
    console.log(window.entryNum);
    
    $("div.side").append("<div><span style='font-size:20px;'>Leap Motion Control</span><br /><span style='color:green; font-weight:bold;'>Device Connected!</span> <br /><span style='font-size:16px;'><input type='checkbox' id='leapcontrol' checked='checked'> Enable Leap Control</span> <div id='console'></div></div>");
};

var events = {
    "onFrame" : onFrame,
    "onConnect" : onConnect
}

$().leap("setEvents", events);