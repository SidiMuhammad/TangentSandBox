const canvas = document.querySelector('svg');

let windowWidth = document.documentElement.clientWidth;
let windowHeight = document.documentElement.clientHeight;

let gridSize = windowWidth > windowHeight ? windowHeight/4 : windowWidth/4;
let gridCol = Math.floor(windowWidth/gridSize);
let gridRow = Math.floor(windowHeight/gridSize);

let canvasWidth = gridSize*gridCol;
let canvasHeight = gridSize*gridRow;

canvas.setAttribute('width', canvasWidth);
canvas.setAttribute('height', canvasHeight);

let pegSize = gridSize/3;
let radSize = {'S': gridSize/6, 'M': gridSize/3, 'L': gridSize/2};

for (let i = 0; i < gridCol; i++) {
    for (let j = 0; j < gridRow; j++) {
        let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('x', i)
        circle.setAttribute('y', j)
        circle.setAttribute('cx', i*gridSize+(gridSize/2));
        circle.setAttribute('cy', j*gridSize+(gridSize/2));
        circle.setAttribute('r', pegSize);
        circle.setAttribute('onclick', 'showSetting(this)');
        canvas.appendChild(circle);
    }
}

let tangPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
tangPath.setAttribute('id', 'tangPath');
canvas.appendChild(tangPath);

let lastPeg, pathCode;
let pegArray = [];

function showSetting(peg) {
    lastPeg = peg;
    closeBox();

    let index;
    if (peg.hasAttribute('index')) {
        index = peg.getAttribute('index');
        document.querySelector('#tangent > .on').classList.remove('on');
        document.querySelector('#radius > .on').classList.remove('on');
        
        document.querySelector('#tangent > #'+pegArray[index].tang).classList.add('on');
        document.querySelector('#radius > #'+pegArray[index].rad).classList.add('on');
    } else {
        index = pegArray.length;
    }
    let x = peg.getAttribute('x');
    let y = peg.getAttribute('y');
    document.querySelector('.node-id').innerHTML = 'peg '+index+' / x'+x+' - y'+y;
}

function confirm() {
    lastPeg.classList.add('fill');

    
    let cx = parseFloat(lastPeg.getAttribute('cx'));
    let cy = parseFloat(lastPeg.getAttribute('cy'));
    let tang = document.querySelector('#tangent > .on').id;
    let rad = document.querySelector('#radius > .on').id;
    let r = radSize[rad];

    if (lastPeg.getAttribute('r') != r) {
        lastPeg.setAttribute('r', r);
    }
    if (lastPeg.hasAttribute('index')) {
        let index = lastPeg.getAttribute('index');
        if (tang != pegArray[index].tang || rad != pegArray[index].rad) {
            pegArray[index].tang = tang;
            pegArray[index].rad = rad;
            pegArray[index].r = r;
            console.log('change');
            if (index == 0) {
                console.log('first');
            } else if (index == pegArray.length-1) {
                console.log('last');
            } else {
                console.log('between');
            }
            changePath();
        }
    } else {
        lastPeg.setAttribute('index', pegArray.length);
    
        pegArray.push(new Peg(cx, cy, tang, rad, r));
        
        if (pegArray.length > 1) {
            drawPath(pegArray.length-2, pegArray.length-1);
        }
    }
    closeBox();
}

function endPath() {
    drawPath(pegArray.length-1, 0);
    pathCode += getPathArc(pegArray[0]);
    pathCode += ' Z';
    tangPath.setAttribute('d', pathCode);
    tangPath.classList.add('fill');
}

function toggleSwitch(e) {
    let option = e.querySelectorAll('.option');
    
    for (let i = option.length-1; i >= 0; i--) {
        if (option[i].classList.contains('on')) {
            option[i].classList.toggle('on');
            option[(i+1)%option.length].classList.toggle('on');
            break;
        }
    }
}

function closeBox() {
    lastPeg.classList.toggle('select');
    document.querySelector('.overlay').classList.toggle('hidden');
}

function drawPath(index1, index2) {
    let peg1 = pegArray[index1];
    let peg2 = pegArray[index2];
    peg1.setNextTang(peg2);

    if (index1 == 0) {
        pathCode = ['M', peg1.nextTang[0], peg1.nextTang[1], 'L', peg2.prevTang[0], peg2.prevTang[1]].join(' ');
        tangPath.setAttribute('d', pathCode);
    } else {
        let large, sweep, tangAngleDiff;

        sweep = peg1.tang == 'T' ? 1 : 0;
        tangAngleDiff = sweep ? peg1.prevTang[2]-peg1.nextTang[2] : peg1.nextTang[2]-peg1.prevTang[2];
        tangAngleDiff = (tangAngleDiff+360)%360;
        large = tangAngleDiff > 180 ? 1 : 0;
        pathCode = [pathCode+getPathArc(peg1), 'L', peg2.prevTang[0], peg2.prevTang[1]].join(' ');
        tangPath.setAttribute('d', pathCode);
    }
}

function getPathArc(peg) {
    console.log(peg);
    let arcPath ='';
    if (peg.prevTang[2] != peg.nextTang[2]) {
        let large, sweep, angleDist;

        sweep = peg.tang == 'T' ? 1 : 0;
        angleDist = sweep ? peg.prevTang[2]-peg.nextTang[2] : peg.nextTang[2]-peg.prevTang[2];
        large = (angleDist+360)%360 > 180 ? 1 : 0;
        arcPath = [' A', peg.r, peg.r, 0, large, sweep, peg.nextTang[0], peg.nextTang[1]].join(' ');
    }
    return arcPath;
}

function changePath() {
    for (let i = 0; i < pegArray.length-1; i++) {
        drawPath(i, i+1);
    }
    if (pegArray[0].prevTang) {
        endPath();
    }
}