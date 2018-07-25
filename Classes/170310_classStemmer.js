//CLASS 4 - Stemmer Algorithm//
var commonWordsText = "the,be,to,of,and,a,in,that,have,I,it,for,not,on,with,he,as,you,do,does,at,this,but,his,by,from,they,we,say,her,she,or,an,will,my,one,all,would,there,their,what,so,up,out,if,about,who,get,which,go,me,when,make,can,like,time,no,just,him,know,take,people,into,year,your,good,some,could,them,see,other,than,then,now,look,only,come,its,over,think,also,back,after,use,two,what,when,where,why,how,our,work,first,well,way,even,new,want,because,any,these,give,day,most,us,time,person,year,way,day,thing,man,world,life,hand,part,child,eye,woman,place,work,week,case,point,government,company,number,fact,be,have,do,say,said,get,make,go,know,take,see,come,think,look,want,give,use,find,tell,ask,work,seem,feel,try,leave,call,good,new,first,last,long,great,little,own,other,old,right,big,high,different,small,large,such,next,early,young,important,few,public,bad,same,able,was,were,is,are,has,have,it,those,had,did,run,ran,between,within,more,less,across,been,require,requires,however,where,whereas,though,although,furthermore,moreover,show,both,according,accordingly,begin,begun,determine,yet,many,often,may,might,et,al,must,during,include,includes,exclude,excludes,meanwhile,sent,send,sends,sending,while,upon,work,working,across,something";


function DocManip() {
    //this is a "scope-safe constructor", just in case the user forgets to use the "new" keyword when creating a new instance of class (this prevents making changes to the class itself)
    if ( !(this instanceof DocManip) )
        return new DocManip();
}

//set_array_cw = set array common words
DocManip.set_array_cw = function() { return commonWordsText.split( "," ); }

//Also present in class SearchWord
DocManip.check_asterisks = function( getWord ) {
    //starStat records value corresponding to position of asterisks at beginning or end of the word. 
    var checkAsterisk = /[\*\+]/i;        //the "*" means 0 or more occurrences of character (e.g. car* = ca, car, carrr) & "+" means 1 or more occurrences (e.g. car+ = car, carrr, carrrrrr)
    var frontStar = false;
    var endStar = false;
    var firstChar = getWord.charAt( 0 );
    var lastChar = getWord.charAt( getWord.length - 1 );
    
    if( firstChar.match( checkAsterisk ) )
        frontStar = true;

    if( lastChar.match( checkAsterisk ) )
        endStar = true;

    return [ frontStar, endStar ];
}

//Also present in class SearchWord
DocManip.format_search = function( getWord, modifier ) {
    //VARS: getWord = the string that will be checked for special characters; modifier = the RegExp modifier that will be appended to the start & end of string "getWord"
    //METHOD: this function formats a word for RegExp formatting by appending modifiers (e.g. word boundary "\b") to the start & end of the string "getWord" unless special characters such as "*" or "+" occur in the beginning
    //if word contains "*", this is a wildcard character & should consider other characters where the "*" is presents
    if( modifier != null ) {
        var formatWord = modifier + "" + getWord + "" + modifier;
        var cCLen = modifier.length;
    }
    else {
        var formatWord = getWord;
        var cCLen = 0;
    }

    //STEP: check for "*" or "+" at the ends (start & end) of the word
    var starStat = DocManip.check_asterisks( getWord );
    if( starStat[0] )
        formatWord = formatWord.substring( cCLen + 1 );

    if( starStat[1] )
        formatWord = formatWord.substring( 0, formatWord.length - cCLen - 1 );

    return formatWord;
}

DocManip.prototype = {
    constructor: DocManip,

    homogenize_text: function( getText ) {
        getText = getText.toLowerCase();
        getText = this.remove_punct( getText )

        return getText;
    },

    remove_punct: function( getText ) {
        //METHOD: this function will remove punctuations by replacing punctuations with blanks
        getText = getText.replace( /[\W]/g, " " );           //removes non-word characters
        return getText;
    },

    remove_single_digits: function( getText ) {
        //METHOD: remove single digits from string "getText"
        return getText.replace(/\b\d\b/g," ");         //removes all numbers with spaces on both sides
    },

    remove_punct_letters: function ( str ) {
        //str = str.replace(/[\W,\s]/g," ");
        str = str.replace(/[\W]/g," ");           //removes non-word characters
        str = str.replace(/\b[a-z]\b/gi," ");     //removes single letters
        str = this.remove_single_digits( str );   //remove single digits from string
        return str;
    },

    process_text: function( getText ) {
        //METHOD: processes text by homogenizing text
        getText = getText.toLowerCase();
        getText = this.remove_punct_letters( getText );
        getText = this.remove_cw( getText );

        return getText;
    },

    doc_words: function( docText, boolRmCW ) {
        //VAR: docText = string that is the document of interest
        //VAR: boolRmCW (boolean Remove Common Words) = boolean that, if true, will remove the common words from docText, else will keep the common words
        //METHOD: this function will return all individual words in the document. Also, this will split compound words or words with non-word characters (e.g. words with hyphens, apostrophes, etc.)
        //OUTPUT: this function will output an array with all the words in the document.

        //STEP: homogenize text (e.g. make all lettering lowercase)
        docText = this.homogenize_text( docText );

        //STEP: if boolRmCW is true, then remove common words
        if(boolRmCW)
            docText = this.remove_cw( docText );

        //STEP: remove all the non-word characters (regExp_NWC_EWS) and then split the document into individual words
        var regExp_NWC_EWS = /[^\w\s]/g;                  //regExp_NWC_EWS (Non-word characters Except White Spaces) = this detects all non-word characters via not considering word characters (\w) nor blank spaces (\s)
        // var newText = docText.replace(regExp_NWC_EWS,"");      //NOTE: I don't think I need to do this after using function "strTools_homogenize_textV0"
        var arrWords = docText.split( " " );
        arrWords = arrWords.filter( function( i ) { return i != undefined; } );
        arrWords = arr_rm_dup(arrWords);
        arrWords = arr_rm_blanks(arrWords);

        return arrWords;
    },

    remove_cw: function( getText ) {
        //METHOD: this function will remove all common words (recorded in listCW = list Common Words) from string "getText" and return get text with words removed
        var modifiers = "gi";
        var listCW = DocManip.set_array_cw();
        for( var x in listCW ){ getText = this.remove( getText, listCW[x], modifiers ); }

        return getText;
    },

    remove: function( fullStr, strRM, modifiers ) {
        //VARS: fullStr = larger string where smaller string "strRM" will be removed from "fullStr"; modifiers = regExp modifiers such as "g" = global, "i" = case-insensitive
        //METHOD: this function will remove a string "strRM" from a larger string "fullStr"

        //STEP: format the word to either search for the whole word unless there are "*" present
        // strRM = escapeRegExp(strRM);           //escape all characters that need to be escaped before creating new RegExp element
        var formatWord = DocManip.format_search( strRM, "\\b" );
        //STEP: create regular expression and search for word & remove string "strRM" from "fullStr"

        var reSearchStr = new RegExp( formatWord, modifiers );
        fullStr = fullStr.replace( reSearchStr, "" );

        // console.log("strTools_removeStr 99 = "+fullStr);
        
        return fullStr;
    }
}





String.prototype.wordSimilarityV1 = function( compareWord, minSim )
{
    //VAR: compareWord = string that will be compared to the word contained in "this"
    //VAR: minSim (minimum similarity) = a decimal number between 0 to 1 comparing the similarity between the two strings "this" & "compareWord".
    //METHOD: this function will compare how similar the string in "this" is to the "secondWord", and will return true if the similarity between both words is greater than or equal to minSim, else returns false

    //STEP: sort the string from shortest to longest. Make both words lowercase as do not want letter casing affecting letter comparison
    var arrStr = [ this.toLowerCase(),compareWord.toLowerCase() ];
    arrStr = arrStr.sort( function (a, b) { return a.length - b.length; } );

    //STEP: check if the string can possibly be larger than the minimum similarity
    if ( ( arrStr[0].length / arrStr[1].length ) < minSim )
        return false;

    //STEP: compare the characters between both strings
    var arrWS=arrStr[0].split("");          //arrWS = array Word Short. An array that contains each letter of the short word
    var arrWL=arrStr[1].split("");          //arrWL = array Word Long. An array that contains each letter of the long word
    var countSim=0;     //countSim = variable that will count the number of the same characters in the same position
    for(var c in arrWS)
        if(arrWS[c]===arrWL[c])     //compare each letter & record how many of the characters are the same
            countSim++;

    //STEP: returns true if the similarity is >= minSim, else returns false
    return countSim/arrWL.length>=minSim;
};

function stemmer_removePreSufFix(wordOI,arrPrefix,arrSuffix)
{
    //VAR: wordOI (word Of Interest) = word that will be checked to see if any prefixes or suffixes are present
    //VAR: arrPrefix = array that contains known prefixes. Note that this has to be in order from longest to shortest as some of the long prefixes could contain a short prefix, therefore do not want remove a short prefix when in actuality a long prefix was the correct prefix (e.g. "a" -> "ab", "anti")
    //VAR: arrSuffix = array that contains known suffixes. Note that this has to be in order from longest to shortest as some of the long suffixes could contain a short suffix, therefore do not want remove a short suffix when in actuality a long suffix was the correct suffix (e.g. "a" -> "ab", "anti")
    //METHOD: this function will remove any prefixes and suffixes the string
    //OUTPUT: this function will return string "wordOI" without any prefixes or suffixes

    //STEP: go through all the prefixes to see if they are present in the word "wordOI"
    for(var x in arrPrefix)
    {
        var boolStrPres = strTools_checkPrefix(arrPrefix[x],wordOI);
        if(boolStrPres)
        {
            var prefixLen = arrPrefix[x].length;
            wordOI = wordOI.substr(prefixLen);
            break;          //need to get out of loop once prefix is found because there is no such thing as multiple prefixes
        }
    }

    //STEP: go through all the suffixes to see if they are present in the word "wordOI"
    for(var x in arrSuffix)
    {
        var boolStrPres = strTools_checkSuffix(arrSuffix[x],wordOI);
        //TEST: console.log("aPS Suffix 1: "+wordOI+" | arrSuffix[x] = "+arrSuffix[x]+" || boolStrPres = "+boolStrPres);
        if(boolStrPres)
        {
            var suffixLen = arrSuffix[x].length;
            var wordOI_pos = wordOI.length-arrSuffix[x].length;       //find where to begin at the end of the string
            wordOI = wordOI.substr(0,wordOI_pos);
            break;          //need to get out of loop once suffix is found because there is no such thing as multiple suffixes
        }
    }

    return wordOI;
}


function classStemmer( docText, stemMinLen, minSimThres )
{
    //VAR: docText = string that is the document that will be analyzed
    //VAR: stemMinLen = the minimum character length for considering stems
    //VAR: stemMinThres = the minimum similarity threshold for a word to be considered similar to the word being compared to
    //CLASS: this class is responsible for identifying words that are similar based on the root word
    //this is a "scope-safe constructor", just in case the user forgets to use the "new" keyword when creating a new instance of class (this prevents making changes to the class itself)
    if ( !(this instanceof classStemmer) )
        return new classStemmer( docText, stemMinLen, minSimThres );


    var docManip = new DocManip();
    this.stemMinLen = stemMinLen;     //this is the minimum character length for considering stems
    this.minSimThres = minSimThres;           //minSim = the minimum similarity threshold for a word to be considered similar to the word being compared to
    this.hashOWS = {};        //hashOWS = hash Original Word to Stem, key = original word, value = stem word
    this.hashSOW = {};        //hashSOW = hash Stem to Original Word, key = stem word, value = array of original word

    //STEP: retrieve all the words in the document, excluding the common words
    // var arrWords = strTools_retrieveDocWords( docText, true );
    var arrWords = docManip.doc_words( docText, true );
    // var arrWords = docManip.doc_words( docText, true );
    
    //STEP: for each word, find words that contain prefix & suffix and remove the prefix & suffix
    var arrTemp = this.trackPreSufFix( arrWords );
    var hashWordPSfix = arrTemp[0];       //hashWordPSfix = hash Word Prefix + Suffix. This hash will have the original word as the key and the value will be word with the modified word (modified words = prefix + suffix removed)
    var arrModWords = arrTemp[1];         //arrWordPSfix = array Word Prefix + Suffix. This array will record all the modified words (modified words = prefix + suffix removed)

    //sort the array of modified words from shortest word to longest word
    arrModWords = strTools_orderWordsByLen( arrModWords, this.stemMinLen, -1, false );

    //STEP: compare the similarity of each word to other words in the list, record the words that meet or surpass the similarity threshold, and then remove the words found
    var hashWordStems = this.compareStems( arrModWords );

    //STEP: find the original word & the defined stem, and record both of them in both hashes "hashOWS" & "hashSOW"
    for(var k in hashWordPSfix)     //k = the original word, hashWordPSfix = the modified word
    {
        //STEP: record original word & corresponding stem word
        var modWord = hashWordPSfix[k];
        //check if the word has a stem - if not (i.e. if undefined), then skip this iteration of the loop
        if( !hashWordStems.hasOwnProperty( modWord ) )      
            continue;

        var wordStem = hashWordStems[modWord];
        this.hashOWS[k] = wordStem;
        
        //STEP: need to check if the key exists in the hash "this.hashSOW" - if not, then create array
        if( !this.hashSOW.hasOwnProperty( wordStem ) )
            this.hashSOW[ wordStem ] = [];
        //push word into array for corresponding word stem
        this.hashSOW[ wordStem ].push( k );
    }
};

classStemmer.prototype.trackPreSufFix = function( arrWords )
{
    //VAR: arrWords = array of words. It does not need to be sorted but it would help
    //METHOD: this function will modified each word to remove any potential prefix and suffix & record each original word & their corresponding string with the prefix & suffix removed
    //OUTPUT: will return 2 outputs - hashWordPSfix & arrWordPSfix
    //OUTPUT: hashWordPSfix = hash Word Prefix + Suffix. This hash will have the original word as the key and the value will be word with the modified word (modified words = prefix + suffix removed)
    //OUTPUT: arrWordPSfix = array Word Prefix + Suffix. This array will record all the modified words (modified words = prefix + suffix removed)

    //STEP: prepare the list of known prefixes & suffixes 
    var strPrefix = "a,ab,anti,de,dis,ex,il,in,mis,non,pre,re,un";
    var strSuffix = "able,al,ed,er,est,less,ness,ful,ible,ing,s,ly,logy,ology,tion,ion";
    //create string of prefixes & suffixes in an array
    var arrPrefix = strPrefix.split( "," );
    var arrSuffix = strSuffix.split( "," );
    //need to order from longest to shortest as some of the short strings could be contained in the long strings (e.g. "a" -> "ab", "anti")
    arrPrefix = strTools_orderWordsByLen( arrPrefix, 0, 0, true );
    arrSuffix = strTools_orderWordsByLen( arrSuffix, 0, 0, true );

    //STEP: go through each word and remove the prefix & suffix and record the modified words and the original word
    var hashWordPSfix = {};       //hashWordPSfix = hash Word Prefix + Suffix. This hash will have the original word as the key and the value will be word with the modified word (modified words = prefix + suffix removed)
    var arrWordPSfix = [];            //arrWordPSfix = array Word Prefix + Suffix. This array will record all the modified words (modified words = prefix + suffix removed)
    for(var w in arrWords)
        hashWordPSfix[arrWords[w]] = stemmer_removePreSufFix( arrWords[w], arrPrefix, arrSuffix );

    //retrieve all the modified words ( modified because the prefix & suffixes are removed )
    var arrModWords = Object.keys( hashWordPSfix ).map( function( key ) { return hashWordPSfix[ key ]; } );
    arrModWords = jQuery.unique( arrModWords );

    return [hashWordPSfix, arrModWords];
};

classStemmer.prototype.compareStems = function( arrModWords )
{
    //VAR: arrModWords (array Modified Words) = an array of words where the prefix & suffix have been removed and has been sorted from shortest word to longest word
    //METHOD: this function will compare the stem words in the array "arrModWords" to find if stems are similar enough to each other
    //OUTPUT: hash that contains the similar word (key) and its stem (value). Therefore, there will be a unique key, but different keys can have the same value.
    var hashWordStems = {};       //hashWordStems = hash will record the stem word & corresponding words associated with the stem. Key = modified word, value = the stem word that is common between this string and other strings
    //STEP: go through each word in the array, comparing the stems, and then removing words that are similar enough to the stem
    for(var i in arrModWords) {
        //STEP: compare the word in arrModWords[i] to each word (arrModWords[j])
        var j = i;        //only compare the words
        for ( var j in arrModWords ) {
            //STEP: compare the two words, and if it is more similar than the threshold "minSimThres", then record the word in hashWordStems & record the index as to remove that word later
            var boolSim = arrModWords[i].wordSimilarityV1( arrModWords[j], this.minSimThres );
            if( boolSim ) {     //if true, then record the word & the stem
                //STEP: check if stem "arrModWords[i]" has another stem, if so then keep traversing 
                if( hashWordStems.hasOwnProperty(arrModWords[ i ]) && ( arrModWords[ i ] != hashWordStems[ arrModWords[ i ] ] ) ) {
                    var rootStem = hashWordStems[arrModWords[i]];
                    while( hashWordStems.hasOwnProperty( rootStem ) && ( rootStem != hashWordStems[ rootStem ] ) ) 
                        rootStem = hashWordStems[ rootStem ];
                }
                else
                    var rootStem = arrModWords[ i ];
                //assign stem word (value) to the modified word (key)
                hashWordStems[ arrModWords[ j ] ] = rootStem;
            }
        }
    }

    return hashWordStems;
};

classStemmer.prototype.translateWordToStem = function( arrSents )
{
    //VAR: arrSents = array of sentences where each element is a sentence
    //METHOD: this function will convert each word in the sentences in array "arrSents" to their respective stem words

    //STEP: go through each sentence, and convert each word to its respective stem
    var arrStemSent=[];
    for(var s in arrSents)
    {
        //STEP: homogenize text & split sentence into individual words
        var homogenSent = homogenize_text( arrSents[s] );
        var arrSW = homogenSent.split( " " );       //arrSW = array Sentence Words
        
        //STEP: go through each word & see if there is a stem associated with the original word
        var arrSS = [];           //arrSS = array Sentence Stems
        for ( var w in arrSW )
        {
            arrSW[w]=$.trim(arrSW[w]);
            if(this.hashOWS[arrSW[w]])      //if original word has stem associated with it, then assign stem word
                arrSS.push(this.hashOWS[arrSW[w]])
            // else         //else if word has not stem associated with it (usually these are words not included for stems, such as common words)
            //  arrSS.push(arrSW[w]);
        }

        //STEP: convert array of stem words into a sentence and assign to 
        var strSS=arrSS.join(" ");      //strSS = string Sentence Stems
        arrStemSent.push(strSS);
    }

    return arrStemSent;
};

classStemmer.prototype.doc_word_to_stem = function( arrSents ) {
    var arrStemSents = this.translateWordToStem( arrSents );
    return arrStemSents.join( " " );
}

classStemmer.prototype.showListWordStems = function( inputStr ) {
    //VAR: inputStr = string that will be used to match to keys in this.hashOWS 
    //METHOD: finds keys in hashOWS (hash Original Word to Stem) that are similar to string 'inputStr'
    var hashMatches = {};
    var regEx = new RegExp( inputStr, 'i' );
    for (var k in this.hashOWS) {
        //if 'inputStr' is in original word, then save it
        if ( k.search(regEx) > -1 )
            hashMatches[k] = this.hashOWS[k];
    }

    return hashMatches;
}
//END: DEFINE CLASSES HERE//


//Other Functions
function homogenize_text( getText ) {
    return getText.toLowerCase().replace( /[\W]/g, " " )
}

function arr_rm_dup( getArr ) {
    //VARS: getArr = an array where each element contains a string
    //METHOD: this function removes multiple copies of specific value, only returning unique values in the array
    var currentVal, strCompare;
    //create new array that will hold all unique values
    var uniqArr = new Array();
    //sort array
    getArr.sort();
    for ( var x in getArr ) {
        if ( x == 0 ) {
            currentVal=getArr[x];
            uniqArr.push(currentVal);
        }
        else {
            //"localCompare" is a javascript function that compares 2 strings - str1.localeCompare(str2). 
            //"localCompare" returns -1 if str1 is sorted before str2, returns 0 if the 2 strings are equal, or returns 1 if str1 is sorted after str2 
            strCompare = currentVal.localeCompare(getArr[x]);
            if(strCompare != 0) {   //means the strings are not same
                currentVal=getArr[x];
                uniqArr.push(currentVal);
            }
        }
    }

    return uniqArr;
}

function arr_rm_blanks(getArr)
{
    //VARS: getArr = array where each element contains a string
    //METHOD: removes all blanks from an array
    var arrNoBlanks = [] ;
    for ( var x in getArr) {
        //remove blanks before & after any word characters
        getArr[x]=getArr[x].trim();
        if( getArr[x] == "" || getArr[x] == " " ){continue;}
        else{arrNoBlanks.push(getArr[x]);}
    }

    return arrNoBlanks;
}