
const [seasonLabel, timeLabel] = getTimeAndSeason()
const weatherCondition = Math.random() < 0.5 ? '-precipitation' : '';

function getTimeAndSeason() {
    let seasonLabel = "summer"
    let timeLabel = "day"
    
    const now = new Date();
    
    const hour = now.getHours();
    const month = now.getMonth(); // 0 = January, 11 = December

    // Daytime: 6 AM to 6 PM
    const isDay = hour >= 6 && hour < 20;

    if (!isDay) {
        timeLabel = "night"
    }

    // Winter (Northern Hemisphere): December, January, February
    const isWinter = (month === 11 || month === 0 || month === 1);

    if (isWinter) {
        seasonLabel = "winter"
    }

    return [seasonLabel, timeLabel]
}

function findNearestBoundaryBelow(col, startRow) {
    for (let searchY = startRow; searchY < roomLayout.length; searchY++) {
        const tile = roomLayout[searchY][col];
        const type = tile.type ?? tile;

        if (type === 3.0) {
            return searchY;
        }
    }

    return -1; // No boundary found below
}

// ADD INIT FUNCTIONS FOR ALL INDIVIDUAL FUNCTIONAL OBJECTS
async function initFunctionalObjects () {
    initWindow2();
    initWindow2s();
    initWindow3();
}



function initWindow2 () {
    const windows = document.querySelectorAll('.window-2-1-l');

    windows.forEach((window) => {
        if (!window) return

        const windowCoords = getObjectCoordinates(window.id)
        
        if (!windowCoords) return

        const nearestBoundary = findNearestBoundaryBelow(windowCoords[0], windowCoords[1])

        let floorLabel = 'top-floor'
        if (nearestBoundary > 14) {
            floorLabel = 'bottom-floor'
        }

        const animationPrefix = `window-2-${floorLabel}-${seasonLabel}-${timeLabel}${weatherCondition}`

        window.style.animationName = animationPrefix;
        if (seasonLabel == "winter") {
            window.style.animationDuration = '2s';
        } else {
            window.style.animationDuration = '1s';
        }
        
        window.style.animationTimingFunction = 'steps(8)';
        window.style.animationIterationCount = 'infinite';
    });
}

function initWindow2s () {
    const windows = document.querySelectorAll('.window-2-1-s');

    windows.forEach((window) => {
        if (!window) return

        const animationPrefix = `window-2-s-${seasonLabel}-${timeLabel}${weatherCondition}`

        window.style.animationName = animationPrefix;
        if (seasonLabel == "winter") {
            window.style.animationDuration = '2s';
        } else {
            window.style.animationDuration = '1s';
        }
        
        window.style.animationTimingFunction = 'steps(8)';
        window.style.animationIterationCount = 'infinite';
    });
}

function initWindow3 () {
    const windows = document.querySelectorAll('.window-3-1-l');

    windows.forEach((window) => {
        if (!window) return

        const windowCoords = getObjectCoordinates(window.id)
        
        if (!windowCoords) return

        const nearestBoundary = findNearestBoundaryBelow(windowCoords[0], windowCoords[1])

        let floorLabel = 'top-floor'
        if (nearestBoundary > 14) {
            floorLabel = 'bottom-floor'
        }

        const animationPrefix = `window-2-${floorLabel}-${seasonLabel}-${timeLabel}${weatherCondition}`

        window.style.animationName = animationPrefix;
        if (seasonLabel == "winter") {
            window.style.animationDuration = '2s';
        } else {
            window.style.animationDuration = '1s';
        }
        
        window.style.animationTimingFunction = 'steps(8)';
        window.style.animationIterationCount = 'infinite';
    });
}