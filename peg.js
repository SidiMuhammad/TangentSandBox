class Peg {
    constructor(cx, cy, tang, rad, r) {
        this.cx = cx;
        this.cy = cy;
        this.tang = tang;
        this.rad = rad;
        this.r = r;
    }

    setNextTang(peg2) {
        let dx = peg2.cx-this.cx;
        let dy = this.cy-peg2.cy;

        let hypo = Math.hypot(dx, dy);
        let coorDiffAngle = this.getAngleDeg(Math.atan2(dy, dx));

        let angle1, angle2;

        if (this.tang == peg2.tang) {
            let exAngle = this.getAngleDeg(Math.acos(Math.abs(peg2.r-this.r)/hypo));
            
            if (this.tang == 'T') {
                angle1 = angle2 = this.r < peg2.r ? 180-exAngle+coorDiffAngle : exAngle+coorDiffAngle;
            } else {
                angle1 = angle2 = this.r < peg2.r ? 180+exAngle+coorDiffAngle : coorDiffAngle-exAngle;
            }
        } else {
            let inAngle = this.getAngleDeg(Math.acos(Math.abs(peg2.r+this.r)/hypo));

            if (this.tang == 'T') {
                angle1 = coorDiffAngle+inAngle;
                angle2 = 180+coorDiffAngle+inAngle;
            } else {
                angle1 = 360+coorDiffAngle-inAngle;
                angle2 = 180+coorDiffAngle-inAngle;
            }
        }
        
        angle1 = (angle1+360)%360;
        angle2 = (angle2+360)%360;

        let coor1 = this.getAngleCoor(this.cx, this.cy, this.r, angle1);
        let coor2 = this.getAngleCoor(peg2.cx, peg2.cy, peg2.r, angle2);

        this.nextTang = [coor1[0], coor1[1], angle1];
        peg2.prevTang = [coor2[0], coor2[1], angle2];
    }

    getAngleDeg(radians) {
        return radians*180/Math.PI;
    }

    getAngleCoor(cx, cy, r, angle) {
        let angleRad = (360-angle)*Math.PI/180;

        return [cx+r*Math.cos(angleRad), cy+r*Math.sin(angleRad)];
    }
}