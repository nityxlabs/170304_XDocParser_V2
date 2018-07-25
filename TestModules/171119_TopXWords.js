/*
Test Module 171119_TopXWords.js
Synopsis: find the top X words associated with document
nickname prefix: tm1
*/
"use strict";

function tm1_displayTopXWords( fullStr, topX ) {
    /*
    VAR: fullStr = string that contains the text
    VAR: topX = number that refers to the first X elements of the array
    METHOD: outputs top-occurring words (word - frequency) 
    */
    var boolGtoL = true;
    var boolInclusive = true;

    var arrSortedNumStrPair = strTools_AllWordsFreqSortedTopX( fullStr, topX, boolGtoL, boolInclusive )
    console.log( arrSortedNumStrPair );
}

function tm1_topCoOccurWords( word ) {
    /*
    VAR: g_COW (object Co-Occurring Words) = instance of class CoOccurWord
    VAR: word = string that is being searched through text
    METHOD: will display words co-occurring words with 
    NOTE: g_COW (object Co-Occurring Words) = instance of class CoOccurWord. NOTE: as of now, I have this set to deal with stem words, not the full word (e.g. words like "bars, bar, barred" could be classified as stem "bar")
    */
    var hashCOW = g_COW.findCoOccurWords( word );
    console.log( "word = ", word, ":\n", hashCOW );
}

/* Navigate through Hierarchical Clustering */
function tm1_clickHierarchy( word, strSentI, boolStem, arrHierarchyWords ) {
    /*
    VAR: word = string that is being searched through text. NOTE: this depends on the type of sentences recorded g_COW (instance of CoOccurWords), whether it is full words or stem words (depends on function createCOWObj())
    VAR: strSentI = string that is a sequence of integers delimited by commas, these integers refer to sentence indices for the document.
        -if strSentI is null, then will retrieve every sentence in document (via g_COW.arrSent)
    VAR: boolStem = boolean that dictates which words will be used by class HighlightDoc
        -true = will append all words associated 
        -false = will append just the word in the parameter space "word"
    VAR: arrHierarchyWords = array of words already considered in hierarchy
    METHOD: retrieves the sentences that contain "word" and returnst the top-occurring words 
    NOTE: g_COW (object Co-Occurring Words) = instance of class CoOccurWord -> I am able to set this as considering full words or "stem" words (e.g. words like "bars, bar, barred" could be classified as stem "bar")
    */
    //TEST::
    console.log( "tm1_clickHierarchy: word = ", word, " & word stem = ", g_objStemmer.hashSOW[ word ] );

    //add words to g_HLD (global HighlightDoc instance)
    if ( boolStem ) {
        g_objStemmer.hashSOW[ word ].forEach( function( w, i ) { 
            console.log( "add word to highlight ", i, ": ", w );
            g_HLD.addWord( w );
        });
    }
    else { g_HLD.addWord( word ); }     //just add the word to the HighlightDoc instance

    var arrSentI = [];
    // ( strSentI == "null" ) ? arrSentI = g_COW.arrSentI : arrSentI = strSentI.split(',').map( Number );
    ( strSentI == null ) ? arrSentI = null : arrSentI = strSentI.split(',').map( Number );
    //find the sentences that contain "word"
    var sentMatchI = g_COW.findSentI_SelectSent( word, arrSentI );

    //TEST::
    console.log( "sentMatchI = ", sentMatchI );

    //find the most common words occurring in the same sentences as "word"
    var nspCW = g_COW.findMostCommonWords_SelectSent( sentMatchI, 10 );        //nspCW = Number-String Pair Common Words
    
    //TEST::
    console.log( "nspCW = ", nspCW, " & arrHierarchyWords = ", arrHierarchyWords );

    nspCW = strTools_RemoveWordsNSP( arrHierarchyWords, nspCW, true, true )

    //create button for each word
    var strSentMatchI = sentMatchI.join(',');
    var htmlButtons = "<input id = 'tm1_hierarchy_strSentI' type = 'hidden' strSentI = " + strSentMatchI + ">";
    for (var i in nspCW) {
        var nspSplit = nspCW[i].split(':');     //[0] = frequency of word occurrence, [1] = word
        htmlButtons += "<button onclick = 'tm1_clickHierarchy_Front_2(event)' wordOI = " + nspSplit[1] + ">" + nspCW[i] + "</button><br/>";
    }

    return htmlButtons;
}


/* Functions for HighlightDoc_171208.js */
function saveDocV2_TEST() {
    /*
    Protocol:
        -retrieve text that is the document
        -split document into full sentences
        -submit to class HighlightDoc.js
        -display the text
    Protocol for showing modified text (e.g. highlight words/sentences)
        -add new word with this.addWord()
        -use this.highlightFoundWords( true ) = returns an array of sentences with all the words highlighted
            -find words associated with stem: use WordStemmer_151213.js -> class classStemmer --> this.hashSOW (stemmer to word) -> submit to highlightWord.js -> this.addWord()
        -use this.highlightSentences( true ) = returns an array of sentences with sentences highlighted that contain all words
    */
    //value to group sentences together
    var groupSent = parseInt( $('#setGroupSent').val() );

    //split document into individual words
    var fullSent = new FullSent( $('#textUpload').val(), g_charSentThres );
    g_HLD = new HighlightDoc( fullSent.arrCompSent );       //NOTE: g_HLD records the document with full words, where g_COW records the document where words replaced their stem words

    //compile sentences
    var compileSent = g_HLD.arrSents.map( function( sent, i ) {
        if (i % groupSent == 0)
            return "<span id = 'sentbg" + i + "' onclick = 'highlightSent(event)' style = 'background-color:transparent;'>" + sent + "</span><br/><br/>";
        else
            return "<span id = 'sentbg" + i + "' onclick = 'highlightSent(event)' style = 'background-color:transparent;'>" + sent + "</span>";
    } );

    //display document
    var fontSize = $('#setFontSize').val();
    var lineHeight = fontSize * 2;
    $('#docViewArea').html( compileSent );

    // $('#docViewArea').css( 'font-size', fontSize );
    // $('#docViewArea').css( 'line-height', lineHeight );

    $('#docViewArea').css( 'font-size', fontSize + 'px' );
    $('#docViewArea').css( 'line-height', lineHeight + 'px' );

    //Save document to hidden input fields
    $('#DocFull').val( $('#textUpload').val() );
    //create a version of the text where common words are removed
    var textRCW = strTools_removeCommonWords_SelectText( $('#textUpload').val() );      //textRCW = text Remove Common Words
    $('#DocFullCWR').val( textRCW );

    //create word stemmer algorithm
    g_objStemmer = new classStemmer( $('#textUpload').val(), g_stemMinLen, g_minSimThres );

    //create CoOccurWord object - 
    var fullSentRCW = new FullSent( textRCW, g_charSentThres - 10 );
    var arrStemSent = g_objStemmer.translateWordToStem( fullSentRCW.arrCompSent );
    createCOWObj( false );
}

function tm1_highlightWords() { 
    /* displays document with highlighted words */
    //determine if the user wants to only highlight words that co-occur together in the same sentence or not
    var statAll;
    ( $("#checkboxStatAllWords").prop( "checked" ) ) ? statAll = true : statAll = false;        //can also use $("#some_id").is( ":checked" )

    //TEST::
    console.log( "checkbox = ", $("#checkboxStatAllWords").prop( "checked" ), " & statAll = ", statAll );

    var arrSentsHLW = g_HLD.highlightFoundWords( statAll );        //arrSentsHLW = array of sentences with Highlighted Words
    //display document
    displayDoc( arrSentsHLW );
}

function tm1_highlightSents() {
    /* displays document with highlighted sentence */
    //determine if the user wants to only highlight words that co-occur together in the same sentence or not
    var statAll;
    ( $("#checkboxStatAllWords").prop( "checked" ) ) ? statAll = true : statAll = false;        //can also use $("#some_id").is( ":checked" )
    var arrSentsHLS = g_HLD.highlightSentences( true, statAll );       //arrSentsHLS = array of sentences with Highlighted Sentences
    //display document
    displayDoc( arrSentsHLS );
}

function tm1_highlightSentsRainbow() {
    /* displays document with highlighted sentence */
    //determine if the user wants to only highlight words that co-occur together in the same sentence or not
    var arrSentsHLS, legend, displayLegend;        //arrSentsHLS = array of sentences with Highlighted Sentences
    [arrSentsHLS, legend] = g_HLD.highlightSentencesUniqueWords( true, parseInt( $("#tm1_input_rainbowThres").val() ) );
    
    //display document
    displayDoc( arrSentsHLS );
    //display legend
    displayLegend = "<div style = 'width:200px; overflow-wrap:break-word;'>" + g_HLD.listWords.join(', ') + "<br/>" + legend + "</div>";
    $("#tm1_output_rainbowScale").html( displayLegend );
}


