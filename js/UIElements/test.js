function getNewElemPosX(self) {
    if (this.openPositionRelativeToCaller.search(/left/i) > -1) {
        align = "left";
    } else if (this.openPositionRelativeToCaller.search(/Right/i) > -1) {
        align = "right";
    } else if (this.openPositionRelativeToCaller.search(/center/i) > -1) {
        align = "center";
    }

    switch (align) {
        case "left":
            leftDistance = callerStartX;
            rightDistance = clientWidth - callerStartX;

            if (leftDistance > rightDistance) {
                newElemX = clientWidth - callerStartX;
                startX = "right";
            } else {
                newElemX = callerStartX;
                startX = "left";
            }

            break;
        case "center":
            leftDistance = callerMiddleX;
            rightDistance = clientWidth - callerMiddleX;

            if (leftDistance > rightDistance) {
                newElemX = clientWidth - callerMiddleX;
                startX = "right";
            } else {
                newElemX = callerMiddleX;
                startX = "left";
            }

            break;
        case "right":
            leftDistance = callerEndX;
            rightDistance = clientWidth - callerEndX;

            if (leftDistance > rightDistance) {
                newElemX = clientWidth - callerStartX - callerWidth;
                startX = "right";
            } else {
                newElemX = callerStartX;
                startX = "left";
            }
            break;
    }
}
