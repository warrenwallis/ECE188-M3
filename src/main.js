//
//
//

var TINYTYPE = TINYTYPE || {}
let page = 0, isDown, points, r, g, rc;
let thumbs = 0,
    index = 0,
    middle = 0,
    ring = 0,
    pinky = 0;
let i = 0, token = 0, which;
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                       {color: '#00FF00', lineWidth: 5});
        drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});

        //console.log('x is',landmarks[0].x);
        //console.log('y is',landmarks[0].y);
        //console.log("thumb to wrist:", Math.hypot(landmarks[0].x - landmarks[4].x, landmarks[0].y - landmarks[4].y));
        //console.log("index to wrist:", Math.hypot(landmarks[0].x - landmarks[8].x, landmarks[0].y - landmarks[8].y));
        //console.log("middle to wrist:", Math.hypot(landmarks[0].x - landmarks[12].x, landmarks[0].y - landmarks[12].y));
        //console.log("ring to wrist:", Math.hypot(landmarks[0].x - landmarks[16].x, landmarks[0].y - landmarks[16].y));
        //console.log("pinky to wrist:", Math.hypot(landmarks[0].x - landmarks[20].x, landmarks[0].y - landmarks[20].y));
        
        thumbs = Math.hypot(landmarks[0].x - landmarks[4].x, landmarks[0].y - landmarks[4].y);
        index = Math.hypot(landmarks[0].x - landmarks[8].x, landmarks[0].y - landmarks[8].y);
        middle = Math.hypot(landmarks[0].x - landmarks[12].x, landmarks[0].y - landmarks[12].y);
        ring = Math.hypot(landmarks[0].x - landmarks[16].x, landmarks[0].y - landmarks[16].y);
        pinky = Math.hypot(landmarks[0].x - landmarks[20].x, landmarks[0].y - landmarks[20].y);
      }

      let fingers = [thumbs, index, middle, ring, pinky];
      let averages = [0.228855925713142, 0.33346074055961, 0.322248931844184, 0.300157791079334, 0.256935637326885];
      let on = [false, false, false, false, false];

      for (const [index, element] of fingers.entries()) {
          if (element > averages[index])
              on[index] = true;
      }

      which = '';
      if (!on[0] && on[4] && on[3]) {
          console.log(4);
          which = String.fromCodePoint(0x1F602);
      }
      else if (on[2] && !on[4]) {
          console.log(3);
          which = String.fromCodePoint(0x1F48B);;
      }
      else if (on[1] && !on[3]) {
          console.log(2);
          which = String.fromCodePoint(0x1F497);
      }
      else if (on[0] && on[4]) {
          console.log(5);
          which = String.fromCodePoint(0x1F351);
      }
      else if (on[0]) {
          console.log(1);
          which = String.fromCodePoint(0x1F346);
      }
      else {
          console.log(0);
          which = '';
      }
    }
    //console.log('token', token);
    if (token && which != '') {
        $('#textbox').val($('#textbox').val() + which);
        token = 0;
    }
    canvasCtx.restore();
  }
  
  const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }});
  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  hands.onResults(onResults);
  
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({image: videoElement});
    },
    width: 1280,
    height: 720
  });
  camera.start();

$(document).ready(() => {
    //
    //  TIP: how you print information
    //
    console.log('Welcome to TINYTYPE!')

    // initialize the canvas
    TINYTYPE.showUI();

    // add input event handlers
    $('#button0').on('click', TINYTYPE.clickButton0);
    $('#button1').on('click', TINYTYPE.clickButton1);
    $('#button2').on('click', TINYTYPE.clickButton2);
    $('#button3').on('click', TINYTYPE.clickButton3);
    $('#button4').on('click', TINYTYPE.clickButton4);
    $('#button5').on('click', TINYTYPE.clickButton5);
    $('#button6').on('click', TINYTYPE.clickButton6);
    $('#button7').on('click', TINYTYPE.clickButton7);
    $('#myCanvas').on('mousedown', TINYTYPE.canvasMouseDown);
    $('#myCanvas').on('mousemove', TINYTYPE.canvasMouseMove);
    $('#myCanvas').on('mouseup', TINYTYPE.canvasMouseUp);
})

//
//
//
// function for updating buttons based on what window the user is in
// 0 = main, 1 = aeiouy, 2 = bcdf, 3 = ghjk, 4 = lmnp, 5 = qrst, 6 = vwxz 
// have hard mappings to buttons and choos which mapping to show based on window
// 0 = aeiou, a, b, g, l, q, v; 1 = bcdf, e, c, h, m, r, w; 2 = ghjk, i, d, j, n, s, x; 3 = lmnp, o, f, k, p, t, z; 4 = qrst, u, back; 5 = vwxz, y; 6 = space; 7 = delete
//
// with the addition of emoji's, have a new window (8) that hosts the canvas and hides all the button except back, space, delete
// keep pre-defined objects for emoji, so map triangle to emoji1, x to emoji2, rectangle to emoji3, circle to emoji4, check to emoji5
// with the addition of camera, have a new window (9)

TINYTYPE.showUI = function () {
    console.log('called showUI function');
    switch(page) {
        case 0:
            console.log('page == 0');
            $('#button0').text('AEIOUY');
            $('#button1').text('BCDF' + String.fromCodePoint(0x1F602));
            $('#button2').text('. GHJK .');
            $('#button3').text('LMNP' + String.fromCodePoint(0x1F4F8));
            $('#button4').text('. QRST .');
            $('#button5').text('. VWXZ .');
            break;
        case 1:
            console.log('page == 1');
            $('#button0').text('A');
            $('#button1').text('E');
            $('#button2').text('I');
            $('#button3').text('O');
            $('#button4').text('U');
            $('#button5').text('Y');
            break;
        case 2:
            console.log('page == 2');
            $('#button0').text('B');
            $('#button1').text('C');
            $('#button2').text('D');
            $('#button3').text('F');
            $('#button4').text('BACK');
            $('#button5').text('EMOJI');
            break;
        case 3:
            console.log('page == 3');
            $('#button0').text('G');
            $('#button1').text('H');
            $('#button2').text('J');
            $('#button3').text('K');
            $('#button4').text('BACK');
            $('#button5').text('');
            break;
        case 4:
            console.log('page == 4');
            $('#button0').text('L');
            $('#button1').text('M');
            $('#button2').text('M');
            $('#button3').text('P');
            $('#button4').text('BACK');
            $('#button5').text('CAM');
            break;
        case 5:
            console.log('page == 5');
            $('#button0').text('Q');
            $('#button1').text('R');
            $('#button2').text('S');
            $('#button3').text('T');
            $('#button4').text('BACK');
            $('#button5').text('');
            break;
        case 6:
            console.log('page == 6');
            $('#button0').text('V');
            $('#button1').text('W');
            $('#button2').text('X');
            $('#button3').text('Z');
            $('#button4').text('BACK');
            $('#button5').text('');
            break;
        case 7:
            console.log('page == 7');
            $('#button0').hide();
            $('#button1').hide();
            $('#button2').hide();
            $('#button3').hide();
            $('#button4').hide();
            $('#button5').text('BACK');
            $('#myCanvas').show();
            initialize();
            break;
        case 8:
            console.log('page == 8');
            $('#button0').hide();
            $('#button1').hide();
            $('#button2').hide();
            $('#button3').hide();
            $('#button5').text('ACCEPT');
            $('.output_canvas').show();
            break;
    }
    $('#textbox').focus();
}

TINYTYPE.clickButton0 = function (e) {
    switch(page) {
        case 0:
            page = 1;
            break;
        default:
            $('#textbox').val($('#textbox').val() + $('#button0').text());
            page = 0;
            break;
    }
    
    TINYTYPE.showUI();
}

TINYTYPE.clickButton1 = function (e) {
    switch(page) {
        case 0:
            page = 2;
            break;
        default:
            $('#textbox').val($('#textbox').val() + $('#button1').text());
            page = 0;
            break;
    }
    
    TINYTYPE.showUI();
}

TINYTYPE.clickButton2 = function (e) {
    switch(page) {
        case 0:
            page = 3;
            break;
        default:
            $('#textbox').val($('#textbox').val() + $('#button2').text());
            page = 0;
            break;
    }
    
    TINYTYPE.showUI();
}

TINYTYPE.clickButton3 = function (e) {
    switch(page) {
        case 0:
            page = 4;
            break;
        default:
            $('#textbox').val($('#textbox').val() + $('#button3').text());
            page = 0;
            break;
    }
    
    TINYTYPE.showUI();
}

TINYTYPE.clickButton4 = function (e) {
    switch(page) {
        case 0:
            page = 5;
            break;
        case 1:
            $('#textbox').val($('#textbox').val() + $('#button4').text());
            page = 0;
            break;
        case 8:
            $('#button0').show();
            $('#button1').show();
            $('#button2').show();
            $('#button3').show();
            $('.output_canvas').hide();
            token = 0;
            page = 4;
            break;
        default:
            page = 0;
            break;
    }
    
    TINYTYPE.showUI();
}

TINYTYPE.clickButton5 = function (e) {
    switch(page) {
        case 0:
            page = 6;
            break;
        case 1:
            $('#textbox').val($('#textbox').val() + $('#button5').text());
            page = 0;
            break;
        case 2:
            console.log("its emoji time!");
            page = 7;
            break;
        case 4:
            console.log('its camera time!');
            token = 1;
            page = 8;
            break;
        case 7:
            $('#button0').show();
            $('#button1').show();
            $('#button2').show();
            $('#button3').show();
            $('#button4').show();
            $('#myCanvas').hide();
            page = 2;
            break;
        case 8:
            $('#button0').show();
            $('#button1').show();
            $('#button2').show();
            $('#button3').show();
            $('.output_canvas').hide();
            token = 0;
            page = 0;
            break;
        default:
            break;
    }
    
    TINYTYPE.showUI();
}

TINYTYPE.clickButton6 = function (e) {
    $('#textbox').val($('#textbox').val() + ' ');
    token = 1;
    TINYTYPE.showUI();
}

TINYTYPE.clickButton7 = function (e) {
    let result = $('#textbox').val();
    let size = result.length;
    $('#textbox').val(result.substring(0, size - 1));
    token = 1;
    TINYTYPE.showUI();
}

function initialize() {
    $('#myCanvas')[0].width = 75;
    $('#myCanvas')[0].height = 40;
    $('#myCanvas').css('background-color', '#eeeeee');
    TINYTYPE.context = $('#myCanvas')[0].getContext('2d');
    TINYTYPE.context.strokeStyle = "#df4b26";
    TINYTYPE.context.lineJoin = "round";
    TINYTYPE.context.lineWidth = 2;

    points = new Array();
    r = new DollarRecognizer();
}

TINYTYPE.canvasMouseDown = function (e) {
    TINYTYPE.context.clearRect(0, 0, $('#myCanvas').width(), $('#myCanvas').height());
    TINYTYPE.context.beginPath();

    let rect = $('#myCanvas')[0].getBoundingClientRect();
    let x = e.clientX - rect.left, y = e.clientY - rect.top;
    TINYTYPE.context.moveTo(x, y);
    TINYTYPE.context.stroke();

    TINYTYPE.isDragging = true;

    points.length = 1;
    points[0] = new Point(x, y);
}

TINYTYPE.canvasMouseMove = function (e) {
    if (!TINYTYPE.isDragging) return;

    let rect = $('#myCanvas')[0].getBoundingClientRect();
    let x = e.clientX - rect.left, y = e.clientY - rect.top;
    TINYTYPE.context.lineTo(x, y);
    TINYTYPE.context.moveTo(x, y);
    TINYTYPE.context.stroke();

    points[points.length] = new Point(x, y);
}

TINYTYPE.canvasMouseUp = function (e) {
    TINYTYPE.isDragging = false;
    TINYTYPE.context.closePath();

    var result = r.Recognize(points, false);
    console.log(result.Name);
    var write;
    switch (result.Name) {
        case "triangle":
            write = String.fromCodePoint(0x1F602);
            break;
        case "x":
            write = String.fromCodePoint(0x1F48B);
            break;
        case "rectangle":
            write = String.fromCodePoint(0x1F497);
            break;
        case "circle":
            write = String.fromCodePoint(0x1F351);
            break;
        case "check":
            write = String.fromCodePoint(0x1F346);
            break;
    }
    $('#textbox').val($('#textbox').val() + write);
}

