// Lubomir Majchrak
class Game {
    constructor(id, token) {
        this.data = {
            id: id,
            token: token,
            prevTx: -1,
            prevTy: -1,
            line: [],
            playerTx: 1,
            playerTy: 0,
            iter: 0,
            speed: 75,
            score: 0,
            maxSpeed: 75,
            maxScore: 0,
            ival: 0,
            gameWidth: 160,
            gameHeight: 80,
            size: 10,
            roadSize: 6,
        }
        this.data.playerTy = Math.floor(this.data.gameHeight/2);
        this.generateLine();
    }

    drawPlayer(tx,ty) {
        var playerPoints = [
            [tx,ty+1],[tx+1,ty+1],[tx+2,ty+1],[tx+3,ty+1],[tx+4,ty+1],
        ];
        var wheels = [
            [tx,ty],[tx+3,ty],
            [tx,ty+2],[tx+3,ty+2]
        ];

        var prevPlayerPoints = [
            [this.data.prevTx,this.data.prevTy],[this.data.prevTx+3,this.data.prevTy],
            [this.data.prevTx,this.data.prevTy+1],[this.data.prevTx+1,this.data.prevTy+1],[this.data.prevTx+2,this.data.prevTy+1],[this.data.prevTx+3,this.data.prevTy+1],[this.data.prevTx+4,this.data.prevTy+1],
            [this.data.prevTx,this.data.prevTy+2],[this.data.prevTx+3,this.data.prevTy+2]
        ];

        if(this.data.prevTx === -1) prevPlayerPoints = [];
        this.data.prevTx = tx;
        this.data.prevTy = ty;
        return [[playerPoints, 'car'], [wheels, 'wheel']];
        // drawWithStyle(prevPlayerPoints,'road');
        // drawWithStyle(playerPoints,'car');
        // drawWithStyle(wheels,'wheel');
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    generateLine() {
        for(var i=0;i<this.data.gameWidth*2;i++) this.data.line.push(Math.floor(this.data.gameHeight/2));
    }


    fillRoadLine(line) {
        var roadLine = [];
        for(var i=0;i<line.length;i++) {
            for(var j=-this.data.roadSize+1;j<this.data.roadSize;j++) {
                roadLine.push([line[i][0],line[i][1]+j]);
            }
        }
        return roadLine;
    }
    fillEdgeLine(line) {
        var edgeLine = [];
        for(var i=0;i<line.length;i++) {
            edgeLine.push([line[i][0],line[i][1]-this.data.roadSize]);
            edgeLine.push([line[i][0],line[i][1]+this.data.roadSize]);
        }
        return edgeLine;
    }

    fillLinePoints(line) {
        var gH = this.data.gameWidth
        return line.filter(function(point,index){
            return index < gH;
        }).map(function(point,index){
            return [index,point];
        });
    }

    drawEdgeLine(line) {
        var red = [];
        var white = [];
        var div = 6;
        var th = 2;
        var iterd = this.data.iter % div;
        var redDivs = [];
        var whiteDivs = [];
        if(iterd === 0) {
            redDivs = [0,1,2];
            whiteDivs = [3,4,5];
        }
        else if (iterd === 1) {
            redDivs = [0,1,5];
            whiteDivs = [2,3,4];
        }
        else if (iterd === 2) {
            redDivs = [0,4,5];
            whiteDivs = [1,2,3];
        }
        else if (iterd === 3) {
            redDivs = [3,4,5];
            whiteDivs = [0,1,2];
        }
        else if (iterd === 4) {
            redDivs = [2,3,4];
            whiteDivs = [0,1,5];
        }
        else if (iterd === 5) {
            redDivs = [1,2,3];
            whiteDivs = [0,4,5];
        }
        red = line.filter(function(point,index){
            var point0d = point[0] % div;
            return redDivs.indexOf(point0d) > -1;
        });
        white = line.filter(function(point,index){
            var point0d = point[0] % div;
            return whiteDivs.indexOf(point0d) > -1;
        });
        return [[red, 'red'], [white, 'white']];
        // drawWithStyle(red,'red');
        // drawWithStyle(white,'white');
    }

    drawLine(line) {
        var linePoints = this.fillLinePoints(line);
        var road = this.fillRoadLine(linePoints);
        var edge = this.fillEdgeLine(linePoints);
        var toSend = this.drawEdgeLine(edge);
        // drawWithStyle(road,'road');
        toSend.push([road,'road']);
        return toSend;
    }

    moveLine(){
        this.data.line.shift();
        this.data.line.push(Math.floor(this.data.gameHeight/2));
    }

    bumpLine() {
        var gW = this.data.gameWidth;
        var gW2 = gW/2;
        var gW4 = gW/4;
        var gH = this.data.gameHeight;
        var gH2 = gH/2;
        var bump = this.random(0,gH-1);

        var bumpOffset = bump - gH2;
        if(bump < gH2) bumpOffset = gH2 - bump;
        if(bump !== Math.floor(gH2)) {
            var bx = gW+gW2;
            var by = bump;
            var sx = gW+1;
            var sy = gH2;
            var xx = gW+gW4;
            var xy = ((bump - gH2)/2)+gH2;
            if(bump < gH2) xy = bump + (bumpOffset/2);
            var mx = gW+gW2;
            var my = gH2;
            var slope = gW2 / bumpOffset; //old Math.floor(gW/2) / (Math.floor(gH/2) - bump);
            var ox = gW+gW2;
            var oy = xy - (slope * (ox-xx));
            if(bump < gH2) oy = (slope * (ox-xx)) + xy;
            var r = by-oy;
            if(bump < gH2) r = oy-by;
            var ex = gW-2;
            var ey = Math.floor(gH/2);
            for(var i=gW+1;i<(gW*2)-1;i++) {
                var fx = i;
                this.data.line[i] = Math.floor(Math.sqrt((r*r)-((fx-ox)*(fx-ox)))+oy);
                if(bump < gH2) this.data.line[i] = -Math.floor(Math.sqrt((r*r)-((fx-ox)*(fx-ox)))-oy);
            }
        }
        else {
            for(var j=gW+1;j<(gW*2)-1;j++) {
                this.data.line[j] = Math.floor(gH2);
            }
        }
    }

    collision() {
        var tx = this.data.playerTx;
        var ty = this.data.playerTy;
        var playerPoints = [
            [tx,ty],[tx+3,ty],
            [tx,ty+1],[tx+1,ty+1],[tx+2,ty+1],[tx+3,ty+1],[tx+4,ty+1],
            [tx,ty+2],[tx+3,ty+2]
        ];

        var linePoints = this.fillLinePoints([this.data.line[0],this.data.line[1],this.data.line[2],this.data.line[3],this.data.line[4],this.data.line[5]]);
        var megaLinePoints = this.fillRoadLine(linePoints).concat(this.fillEdgeLine(linePoints));

        var allIn = true;
        playerPoints.forEach(function(playerPoint){
            var isIn = false;
            megaLinePoints.forEach(function(linePoint){
                if(playerPoint[0] === linePoint[0] && playerPoint[1] === linePoint[1]) isIn = true;
            });
            if(!isIn) allIn = false;
        });
        return !allIn;
    }

    movePlayer(points) {
        this.data.playerTy = this.data.playerTy + points;
        if(this.data.playerTy<0) this.data.playerTy=0;
        if(this.data.playerTy > this.data.gameHeight-3) this.data.playerTy = this.data.gameHeight-3;
    }
}

module.exports = Game;