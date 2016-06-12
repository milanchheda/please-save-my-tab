var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-77426139-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function showUrls() {
    jQuery("#lastUpdatedTime").html(amplify.store("copiedUrlsDate"));
    var e = className = "",
        s = amplify.store("copiedUrls"),
        a = 0;
    $(s).each(function(s, t) {
        splitValue = t.split("SaveTabs"), className = a % 2 == 0 ? "class=odd" : "class=even", e += "<li " + className + "><a href='" + splitValue[0] + "' class='savedUrls'>" + splitValue[1] + "</a></li>", a++
    }), jQuery("#contentLoader").html("<ul class='copiedUrlsList'>" + e + "</ul>"), $('<input type="checkbox" value="1" class="urlsCheckedOrNot" />').prependTo("li")
}

function displayCurrWinTabsInfo() {
    var selectAll = '<div style="margin-bottom: 8px; border-bottom: dashed 1px #777"><input id="selectAll" type="checkbox" style="" class="checkbox" /> <label style="font-weight: bold; cursor:pointer;" for="selectAll">Select all tabs</label></div>';
    $(".tabListContent").append(selectAll);
    chrome.tabs.getAllInWindow(null, function(tabArray) {
        for (i = 0; i < tabArray.length; i++) {
            var checkBox = '<input type="checkbox" class="tabArrayCheckbox" id=tab_' + i + ' value=' + i + ' /> ';
            $(".tabListContent").append("<div class='currTabItemContainter'>" + checkBox + "<label for='tab_"+i+"' title='" + tabArray[i].url + "'>" + tabArray[i].title + "</label>" + "<br/>" + "</div>");
        }
        $(".panel .newSessionPage").trigger('click');
        $("#selectAll").change(function(){
                $("input:checkbox").prop('checked', $(this).prop("checked"));
        });
    });
}

var storage = chrome.storage.local;
var savedSessions = new Array();

storage.get(null, function(all) {
    var sessionsExist = 0;
    for ( i in all ){
        if ( i.substring(0,4) == "[ST]" ){
            sessionsExist = 1;
            var tabs = all[i].tabs;
            var details = "<div class='details'>";
            details += "<span class='numTabs'>" + tabs.length + " tabs</span>";
            details += ", <span class='timestamp'>saved on: " + all[i].lastSaved + "</span>" ;
            tabs.forEach(function(tab){
                details += "<div class='tabs'><i class='icon-heart-empty'></i> " + tab.title + "</div>";
            });
            
            details += "</div>";
            $(".container .savedSessionPage ul").append("<li class='savedList'>" +
                                                            "<div class='titleLabelBar'>" +
                                                                "<i class='icon-star icon-large'></i><b class='titleLabel'>" + all[i].title  + "</b> (" + all[i].tabs.length + ")" +
                                                                "<div class='sessionControls'>" +
                                                                "<div class='btn exportExcelSessionControl'><i class='icon-external-link '></i>Export Excel</div>" +
                                                                "<div class='btn openSessionControl'><i class='icon-external-link '></i>Open</div>" +
                                                                "<div class='btn deleteSessionControl'><i class='icon-trash'></i>Delete</div></div>" +
                                                            "</div>" + 
                                                            details + 
                                                        "</li>");
            savedSessions.push(all[i].title);
        }
    }
    if(!sessionsExist)
        $(".container .savedSessionPage ul").html("<span class='noSessionsExist'>There are no saved sessions.</span>");

    generateDropdown();
    $(".container .savedSessionPage ul.savedList li.savedList").click(function(event){
        var aControlClicked =
            $(event.target).is(".exportExcelSessionControl") || $(event.target).is(".exportExcelSessionControl > *")
            || $(event.target).is(".openSessionControl") || $(event.target).is(".openSessionControl > *")
            || $(event.target).is(".deleteSessionControl") || $(event.target).is(".deleteSessionControl > *");

        if( !aControlClicked ){
            $(this).children(".details").toggle();
            $(this).toggleClass("expanded");
        }
    });

    $(".exportExcelSessionControl").on('click', function() {
        _gaq.push(['_trackEvent', 'Export to excel', 'Clicked']);
        var tableHtml = "<table><thead></thead><tbody>";
        var selectedSession = $(this).parents(".savedList:first").find(".titleLabel").html();
        storage.get("[ST]"+selectedSession, function(items){
            if ( Object.keys(items).length > 0 ){
                var session = items["[ST]"+selectedSession];
                var tabsUrl = [];
                var tabsPinned = [];
                session.tabs.forEach(function(tab){
                    tableHtml += "<tr><td>" + tab.url + "</td></tr>";
                    tabsUrl.push(tab.url);
                    tabsPinned.push(tab.pinned);
                });
            }
            tableHtml += "</tbody></table>";
            window.open('data:application/vnd.ms-excel,' + tableHtml);
        });
    });

    $(".openSessionControl").on('click', function(){
        _gaq.push(['_trackEvent', 'Open Session', 'Clicked']);
        var selectedSession = $(this).parents(".savedList:first").find(".titleLabel").html();
        storage.get("[ST]"+selectedSession, function(items){
            if ( Object.keys(items).length > 0 ){
                var session = items["[ST]"+selectedSession];
                var tabsUrl = [];
                var tabsPinned = [];
                session.tabs.forEach(function(tab){
                    tabsUrl.push(tab.url);
                    tabsPinned.push(tab.pinned);
                });

                chrome.windows.create({url: tabsUrl, type:"normal"}, function(newWin){
                    newWin.tabs.forEach(function(tab){
                        chrome.tabs.update(tab.id, {pinned: tabsPinned[tab.index]}, function(){});
                    });
                });
            }
        });
    });


    $(".deleteSessionControl").on('click', function(){
        _gaq.push(['_trackEvent', 'Delete Session', 'Clicked']);
        var selectedSession = $(this).parents(".savedList:first").find(".titleLabel").html();
        var confirmToDelete = confirm('Delete Session "' + selectedSession + '" ?');
        if ( confirmToDelete ){
            storage.remove("[ST]"+selectedSession,function(){
                window.location.href = "popup.html";
            });
        }
    });
});

function generateDropdown(){
    var insertMe = "";
    savedSessions.forEach(function(s){
        insertMe += "<option value=" + s +">" + s + "</option>";
    });
    $("#selectExisting").html(insertMe);
}

$(document).ready(function() {
	displayCurrWinTabsInfo();
    
    $(".panel .newSessionPage").on('click',function(){
        _gaq.push(['_trackEvent', 'New Tab', 'Clicked']);
        $(".container").css("background", "#4099FF");
	    $(".container .savedSessionPage, .container .howToPage").hide();
	    $(".container .newSessionPage").show();
	});

	$(".panel .savedSessionPage").on('click',function(){
        _gaq.push(['_trackEvent', 'Saved Session Tab', 'Clicked']);
	    $(".container").css("background", "rgba(63,63,175,0.5)");
	    $(".container .newSessionPage, .container .howToPage").hide();
	    $(".container .savedSessionPage").show(); 
	});

    $(".panel div.howToSessionPage").on('click', function(){
        _gaq.push(['_trackEvent', 'How-to use Tab', 'Clicked']);
        $(".container").css("background", "#B2D885");
        $(".container .newSessionPage, .container .savedSessionPage").hide();
        $(".container .howToPage").show();
    });

    $("#newSaveButton").on('click', function(event){
	    event.preventDefault();
        _gaq.push(['_trackEvent', 'Save button', 'Clicked']);
        var type = $(".newSessionPage input:checked").val();
	    if ( $('input:checkbox:checked.tabArrayCheckbox').length == 0 ){
            setTimeout($(".errorMessages").html("Please select at least one tab from below listed.").fadeIn('fast').delay(3000).slideUp('fast'), 1);
	        return;
	    }
	    if ( type == "new" ){
	        var sessionName = $("#enterSessionName").val();
	        if ( !sessionName ){
                setTimeout(function() {$(".newSessionPage input[type='text']").focus(); $(".errorMessages").html("Please provide name for you session!").fadeIn('fast').delay(3000).slideUp('fast');}, 1);
	        }else{
	            saveAsNewSession(sessionName);
	        } 
	    }else if(type == 'existing'){
	        var sessionName = $(".newSessionPage select option:selected").val();
	        addToExistingSession(sessionName);
	    } else {
            setTimeout(function() {$(".errorMessages").html("Please select one of the session options!").fadeIn('fast').delay(3000).slideUp('fast');}, 1);
        }
	});

    $("#newSessionId").on('click', function(){
        if($(this).is(":checked")) {
            $("#selectExisting").hide();
            if($(this).parent().find('#enterSessionName').length == 0)
                $(this).parent().append('<input type="text" size="30" id="enterSessionName"/>');
        }
    });

    $("#existingSessionId").on('click', function() {
        $("#enterSessionName").fadeOut('slow').remove();
        if($(this).is(":checked"))
            $("#selectExisting").fadeIn('fast');
    });
    
});


function saveAsNewSession(sessionName){
    _gaq.push(['_trackEvent', 'New Session Saved', 'Clicked']);
    checkIfSessionNameExists("[ST]"+sessionName, function(existed){
        if ( existed ){
            alert("Session existed. Adding tabs to the existing session.");
            addToExistingSession(sessionName);
        }else{
            var checkedList = $('input:checkbox:checked.tabArrayCheckbox').map(function(){
                return this.value;
            }).get();
            chrome.tabs.getAllInWindow(null, function(tabArray){
                var tabsToBeSaved = [];
                for (i = 0; i < checkedList.length; i++){
                    var tabIndex = checkedList[i];
                    var tab = {};
                    tab.title = tabArray[tabIndex].title;
                    tab.url = tabArray[tabIndex].url;
                    tab.pinned = tabArray[tabIndex].pinned;
                    tabsToBeSaved.push(tab);
                }

                saveSessionToChromeStorage(sessionName,tabsToBeSaved,function(){
                    window.location.href = "popup.html";
                });
            });     
        }
    });
}


function addToExistingSession(sessionName){
    _gaq.push(['_trackEvent', 'Added to existing session', 'Clicked']);
    storage.get("[ST]"+sessionName, function(items){
        if ( Object.keys(items).length > 0 ){
            var session = items["[ST]"+sessionName];
            var tabsToBeSaved = session.tabs;
            var checkedList = $('input:checkbox:checked.tabArrayCheckbox').map(function(){
                return this.value;
            }).get();
            chrome.tabs.getAllInWindow(null, function(tabArray){
                for (i = 0; i < checkedList.length; i++){
                    var tabIndex = checkedList[i];
                    var tab = {};
                    tab.title = tabArray[tabIndex].title;
                    tab.url = tabArray[tabIndex].url;
                    tab.pinned = tabArray[tabIndex].pinned;
                    tabsToBeSaved.push(tab);
                }
                saveSessionToChromeStorage(sessionName,tabsToBeSaved,function(){
                    window.location.href = "popup.html";
                });
            });     
        }
    });
}

function checkIfSessionNameExists(key,callback){
    var existed = false;
    storage.get(key, function(items){
        if ( Object.keys(items).length > 0 ){
            existed = true;
        }
        callback(existed);
    });
}

function saveSessionToChromeStorage(sessionName,tabsToBeSaved,callback){
    var session = {};
    session.title = sessionName;
    session.lastSaved = new Date().toLocaleString();
    session.tabs = tabsToBeSaved;
    var rowObject = {};
    var key = "[ST]"+sessionName;
    rowObject[key] = session;
    storage.set(rowObject,function(){
        callback();
    });
}