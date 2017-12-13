// MODIFY BUILT-IN JAVASCRIPT OBJECTS

/**
 * adds a function to the built-in javascript String object, which trims a string's leading and trailing whitespace. see mozilla developer network's <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/Trim">trim documentation</a>.
 * @return {string} the string stripped of leading and trailing whitespace.
 */
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  };
}




// GLOBAL VARS

/* constant for golden ratio conjugate, which will be used in various cases like layout and such. */
var PHI = 0.6180339887498948;

/* the color of an "active" key when pressed. */
var keyDownColor = "rgba(255, 0, 0, " + PHI + ")";

/* the color of an "active" key when released. */
var keyUpColor = "rgba(255, 255, 255, " + PHI + ")";

/* the color of an "active" key of special importance key when pressed. */
var highLightKeyDownColor = "rgba(255, 0, 0, " + PHI + ")";

/* the color of an "active" key of special importance, when released. */
var highlightKeyUpColor = "rgba(250, 169, 81, 1)";


/* holds a keycode for a key, and a html color as a value. used so we can return the previous color of a key after it has been highlighted. see onKeyDownEvent() and onKeyUpEvent(). */
var downKeyColors = {};

/* holds the html for the qwerty keyboard which is held in a separate html file and will be fetched on load. see setup(). */
var qwertyKeyboard = "";
var qwertyKeyboardLoaded = false;

/* holds the required info for the lessons which is held in a separate json file and will be fetched on load. see setup(). */
var lessons = [];
var lessonsLoaded = false;

/* current lesson in the tutor. */
var currentLesson = 0;

/* current slide in the lesson. */
var currentSlide = 0;

/* max lesson achieved. */
var maxLesson = 0;






// FUNCTIONS

//// DATASTORE FUNCTIONS
var updateDatastore = function() {
//  var postData = "";
//  postData += "current_lesson=" + currentLesson + '.' + currentSlide;
//  postData += "&";
//  postData += "max_lesson=" + maxLesson;
//  xhrPost("/tutor", postData);
}

//// HTTP REQUEST FUNCTIONS

var xhrGet = function(reqUri, callback, type) {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', reqUri, true);

  if (type) {
    xhr.requestType = type;
  }

  xhr.onload = callback;

  xhr.send();
};


var xhrPost = function(reqUri, params, callback) {
  var xhr = new XMLHttpRequest();

  xhr.open('POST', reqUri, true);

  if (callback) {
    xhr.onload = callback;
  }

  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send(params);
};




//// TEXT FUNCTIONS

/**
 * set font size of an element to the max that will fit in its parent element.
 * @param {string} elementID the element's id which will be adjusted.
 */
var fitText = function (elementID) {
  var element = document.getElementById(elementID);

  if (element) {
    element.style.whiteSpace = "nowrap";

    var maxWidth = element.parentNode.offsetWidth;
    var maxHeight = element.parentNode.offsetHeight;

    for (var fontSize = maxHeight; fontSize >= 0; fontSize--) {
      element.style.fontSize = fontSize + "px";

      if (element.offsetWidth < maxWidth && element.offsetHeight < maxHeight) {
        return;
      }
    }
  } else {
    console.warn("fitText element not found.");
  }
};


/**
 * get the font size that will fit ~55--75 characters per line for a certain width.
 * @param {number} width the width to fit in.
 */
var fontSizeForIdealLineLength = function (width) {
  var testSpan = document.createElement("span");
  testSpan.setAttribute("id", "test-span");
  testSpan.innerHTML = "Quick hijinx swiftly revamped gazebo. Quick hijinx swiftly revamped gazebo.";
  document.body.appendChild(testSpan);

  for (var fontSize = 0; fontSize <= Math.floor(width); fontSize++) {
    testSpan.style.fontSize = fontSize + "px";

    if (testSpan.offsetWidth > width) {
      document.body.removeChild(testSpan);
      return fontSize;
    }
  }
};


/**
 * place an element in the horizontal and vertical middle of its parent element.
 * @param {string} elementID the element's id which will be moved.
 */
var placeCenterMiddle = function (elementID) {
  var element = document.getElementById(elementID);

  if (element) {
    element.style.position = "absolute";
    element.style.left = (element.parentNode.offsetWidth - element.offsetWidth) * 0.5 + "px";
    element.style.top = (element.parentNode.offsetHeight - element.offsetHeight) * 0.5 + "px";
  } else {
    console.warn("placeCenterMiddle element not found.");
  }
};




//// SLIDE FUNCTIONS

var END_SLIDE = -1;

/**
 * set current slide to the next one.
 */
var nextSlide = function() {
  if (lessonsLoaded) {

  	if(currentSlide == END_SLIDE) {
  	  maxLesson = currentLesson;

      return;
  	}

    currentSlide++;

    if (currentSlide < lessons[currentLesson].slides.length) {
      showSlide(currentLesson, currentSlide);
      updateDatastore();
    } else {
      currentLesson++;
      if (currentLesson < lessons.length) {
        currentSlide = 0;
        updateDatastore();
        showEndSlide(currentLesson - 1, lessons[currentLesson].slides.length - 1);
        currentSlide = END_SLIDE;
      } else {
        showEndSlide(currentLesson - 1, lessons[currentLesson - 1].slides.length - 1);
        currentSlide = END_SLIDE;
      }
    }
  }
}


/**
 * set current slide to the previous one.
 */
var prevSlide = function() {
  if (lessonsLoaded) {

    if(currentSlide === 0) {
        return;
    }
    currentSlide--;

    if (currentSlide >= 0) {
      showSlide(currentLesson, currentSlide);
      updateDatastore();
    } else {
      currentLesson--;
        if(currentLesson < 0) {
            currentLesson = 0;
            currentSlide = 0;
            return;
        }
        if(currentSlide < 0) {
          currentSlide = lessons[currentLesson].slides.length - 1;
          updateDatastore();
          showSlide(currentLesson, currentSlide);
        }

        // the code below will automatically take us to the previous lesson
//      if (currentLesson >= 0) {
//        currentSlide = lessons[currentLesson].slides.length - 1;
//        updateDatastore();
//        showSlide(currentLesson, currentSlide);
//      } else {
//        currentLesson++;
//        currentSlide++;
//      }
    }
  }
}

/**
 * build the navigation
 */
var buildSlideNav = function(lesson) {
    var slideNav = document.getElementById("slideNav");

    // TARGET:
//    <li class="current"><a href="">1</a></li>
//        <li><a href="">2</a></li>
//        <li><a href="">3</a></li>
//        <li><a href="">4</a></li>
//        <li><a href="">12</a></li>
//        <li><a href="">13</a></li>
    var html = '';
    for(var i = 0; i < lessons[lesson].slides.length; i++) {
        html += '<li id="slideNav_'+i+'"><a href="#" onclick="showSlide('+currentLesson+', '+i+')">'+i+'</a></li>';
};

    slideNav.innerHTML = html;

};

/**
 * show a particular slide.
 * @param {number} lesson the lesson index.
 * @param {number} slide the slide index.
 */
var showSlide = function(lesson, slide) {

    currentLesson = lesson;
    currentSlide = slide;
  var headerDiv = document.getElementById("header");
  var htmlDiv = document.getElementById("html");
  var keyboardDiv = document.getElementById("keyboard");

    if(slide === 0) {
        buildSlideNav(lesson);
    }

    for(var i = 0; i < lessons[lesson].slides.length; i++) {
        document.getElementById('slideNav_' + i).className = i === slide ? 'current' : '';
    }

  if (lessons[lesson].slides[slide].header &&
      lessons[lesson].slides[slide].html &&
      lessons[lesson].slides[slide].keyboard) {
    headerDiv.style.display = "block";

    //headerDiv.style.backgroundColor = "#FF0000";
    headerDiv.innerHTML = '<span id="header-text">' + lessons[lesson].slides[slide].header + '</span>';
    htmlDiv.style.display = "block";

    //htmlDiv.style.backgroundColor = "#00FF00";
    htmlDiv.innerHTML = '<span id="html-text">' + lessons[lesson].slides[slide].html + '<br /><br />Press these keys on your keyboard. Try it out! <br /><br />' + '</span>';
    keyboardDiv.style.display = "block";
    //keyboardDiv.style.backgroundColor = "#0000FF";
    keyboardDiv.innerHTML = qwertyKeyboard;
    showKeys(lessons[lesson].slides[slide].keyboard);
    adjustKeyboard();

  } else if (lessons[lesson].slides[slide].header &&
             lessons[lesson].slides[slide].html &&
             !lessons[lesson].slides[slide].keyboard) {
    headerDiv.style.display = "block";

    headerDiv.innerHTML = '<span id="header-text">' + lessons[lesson].slides[slide].header + '</span>';
    htmlDiv.style.display = "block";
    //htmlDiv.style.backgroundColor = "#00FF00";
    htmlDiv.innerHTML = '<span id="html-text">' + lessons[lesson].slides[slide].html + '<br /><br />' + '</span>';

    // keyboardDiv.style.display = "none";
  } else if (lessons[lesson].slides[slide].header &&
             !lessons[lesson].slides[slide].html &&
             !lessons[lesson].slides[slide].keyboard) {
    headerDiv.style.display = "block";
    //headerDiv.style.backgroundColor = "#FF0000";
    headerDiv.innerHTML = '<span id="header-text">' + lessons[lesson].slides[slide].header + '</span>';
    htmlDiv.style.display = "none";
    keyboardDiv.style.display = "none";
  }
}

/**
 * show the end slide.
 * @param {number} lesson the lesson index.
 * @param {number} slide the slide index.
 */
var showEndSlide = function(lesson, slide) {
  var headerDiv = document.getElementById("header");
  var htmlDiv = document.getElementById("html");
  var keyboardDiv = document.getElementById("keyboard");

    headerDiv.style.display = "block";
    //headerDiv.style.backgroundColor = "#FF0000";
    htmlDiv.style.display = "block";

    headerDiv.innerHTML = '<span id="header-text">' + 'End of this section' + '</span>';

    htmlDiv.innerHTML = '<span id="html-text">' + '<ul><li>Arrow LEFT to go back and review</li><li>Click here to start a <a href="/quiz?mode=key&unit='+(currentLesson-1)+'">drill</a> on what you have just learned</li><li>Or go to the Steno Keyboard menu to learn about more fingering</li></ul>';

    keyboardDiv.style.display = "block";

    //keyboardDiv.style.backgroundColor = "#0000FF";    
    keyboardDiv.innerHTML = qwertyKeyboard;
    showKeys(lessons[lesson].slides[slide].keyboard);
    adjustKeyboard();
}


//// VIRTUAL KEYBOARD FUNCTIONS

/**
 * adjusts the size of the qwerty keyboard to fit in the lower portion.
 */
var adjustKeyboard = function() {
  // grab qwerty keyboard element.
  var qwertyKeyboardElement = document.getElementById("standard-keyboard");

  // if found, set qwerty keyboard dimensions.
  if (qwertyKeyboardElement) {
    qwertyKeyboardElement.style.height = document.height * (1 - PHI) + "px";
    qwertyKeyboardElement.style.width = 3 * document.height * (1 - PHI) + "px";
  }

  // get the height of a key on the qwerty keyboard.
  if(document.getElementsByClassName("standard-row").length == 0) return;
  var keyHeight = document.getElementsByClassName("standard-row")[0].offsetHeight;

  // grab the qwerty keyboard key elements.
  var qwertyKeyElements = document.getElementsByClassName("standard-key");

  // set the font size the qwerty keyboard keys.
  for (var i = 0; i < qwertyKeyElements.length; i++) {
    qwertyKeyElements[i].style.fontSize = (keyHeight * PHI) + "px";
    qwertyKeyElements[i].style.lineHeight = (keyHeight * PHI * 1.5) + "px";
  }
}


/**
 * callback to set the qwerty keyboard html. see setup().
 */
var loadBlankQwertyKeyboard = function() {
  qwertyKeyboard = this.responseText;
  qwertyKeyboardLoaded = true;
};


/**
 * emphasize keys.
 */
var showKeys = function(translation) {
  var originalKeys = translation.split("|")[0];
  var newKeys = translation.split("|")[1];

  for (var i = 0; i < originalKeys.length; i++) {
    var key = document.getElementById("standard-key-" + originalKeys[i]);

    if(!key) {
      if(originalKeys[i] === ';')
          key = document.getElementById("standard-key-semicolon");
      if(originalKeys[i] === '[')
          key = document.getElementById("standard-key-open-bracket");
      if(originalKeys[i] === '\'')
          key = document.getElementById("standard-key-single-quote");

    }


    if (key) {
      key.style.backgroundColor = originalKeys[i] === newKeys[i] ? highlightKeyUpColor : keyUpColor;
      key.innerHTML = newKeys[i];
    }
  }
}




//// SETUP FUNCTIONS

/**
 * callback to set lesson data.
 */
var loadLessonData = function() {
  lessons = JSON.parse(this.responseText);
  lessonsLoaded = true;
  showSlide(currentLesson, currentSlide);
};


/**
 * initial setup. see window.onload().
 */
var setup = function () {
  var cookies = document.cookie.split(';');

  for (var i = 0; i < cookies.length; i++) {
    var cookieName = cookies[i].split('=')[0].trim();
    var cookieValue = cookies[i].split('=')[1].trim();

    if (cookieName === 'current_lesson') {
      currentLesson = parseInt(cookieValue.split('.')[0], 10);
      currentSlide = parseInt(cookieValue.split('.')[1], 10);
    }

    if (cookieName === 'max_lesson') {
      maxLesson = parseInt(cookieValue, 10);
    }
  }

  xhrGet("../assets/tutorLessons.json", loadLessonData, null);
  xhrGet("../assets/qwertyKeyboard.html", loadBlankQwertyKeyboard, null);

  //document.addEventListener("click", onClickEvent);
  document.addEventListener("keydown", onKeyDownEvent);
  document.addEventListener("keyup", onKeyUpEvent);
  window.addEventListener("resize", onResizeEvent);
}








// EVENT HANDLERS

var onKeyDownEvent = function(event) {
  var keyID = event.keyCode || event.which;

  if (keyID === 37) {
    prevSlide();
  }

  if (keyID === 39) {
    nextSlide();
  }

  var elements = document.getElementsByClassName("code-" + keyID);

  for (var i = 0; i < elements.length; i++) {
    if (!downKeyColors[keyID]) {
      downKeyColors[keyID] = window.getComputedStyle(elements[0]).backgroundColor;
    }

    elements[i].style.backgroundColor = keyDownColor;
  }
}


var onKeyUpEvent = function(event) {
  var keyID = event.keyCode || event.which;

  var elements = document.getElementsByClassName("code-" + keyID);

  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor = downKeyColors[keyID];
  }
  delete downKeyColors[keyID];
}


var onResizeEvent = function() {
  showSlide(currentLesson, currentSlide);
}








// WINDOW ONLOAD


window.onload = function() {
  setup();
};