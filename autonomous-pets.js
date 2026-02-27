const autoPetTimeoutTracker = new Set();

function addAutoPetTimeoutTracker(fn, ms) {
  const id = setTimeout(() => {
    autoPetTimeoutTracker.delete(id);
    fn();
  }, ms);

  autoPetTimeoutTracker.add(id);
  return id;
}

function clearAllAutoPetTimeouts() {
  autoPetTimeoutTracker.forEach(id => clearTimeout(id));
  autoPetTimeoutTracker.clear();
}

function disableAutoPets() {
    clearAllAutoPetTimeouts();
    const autonomousPets = document.querySelectorAll('.auto-pet');

    autonomousPets.forEach((autoPet) => {
        const autoPetId = autoPet.id
        if (!autoPetId) return

        cancelMovement(autoPetId)
        const petType = autoPet.className.split(' ')[0]

        // Apply the same position as the old element
        const [x, y] = userObjectAssets[autoPetId].position
        autoPet.style.left = `calc(${x} * var(--unit-size))`;
        autoPet.style.top = `calc((${y + 1} * var(--unit-size)) - ${autoPet.offsetHeight}px)`;

        // Set it to idle animation (or static frame) using the new element
        setObjectAnimation(autoPet, `${petType}-stands-idle`);
    });
}


const autoPetActionDict = {
  "ghost-1": {
    "initiation": {
        ghostScares: 1,
        ghostWanders: 1.5,
        ghostAppears: 5,
        ghostLingers: 1.5,
        ghostTogglesAppliances: 1
    },
    "maintainance": {
        ghostWanders: 2,
        ghostLingers: 3,
        ghostDisappears: 3,
        ghostTogglesAppliances: 2
    }
  }
};

let autoPetStartingActionSelection = {}

const ghost1ReappearActions = {
    ghostScares: 2,
    ghostAppears: 8
};


async function initiateAutonomousPets () {
  clearAllAutoPetTimeouts()
  const autonomousPets = document.querySelectorAll('.auto-pet');

  autonomousPets.forEach((autoPet) => {
    autoPet._petType = autoPet.className.split(' ')[0]
  });
}

async function selectAutonomousPetStartingActions () {
  const autonomousPets = document.querySelectorAll('.auto-pet');

  autonomousPets.forEach((autoPet) => {
    if (autoPet._busy) return;

    const actionDict = autoPetActionDict[autoPet._petType]?.initiation;

    if (!actionDict) return;

    const functionName = pickWeightedRandom(actionDict);
    const handler = window[functionName];

    autoPetStartingActionSelection[autoPet.id] = handler
  });
}

function initiateAutonomousPetStartingActions () {
  const autonomousPets = document.querySelectorAll('.auto-pet');

  autonomousPets.forEach((autoPet) => {
    const handler = autoPetStartingActionSelection[autoPet.id];

    if (typeof handler === "function") {
      handler(autoPet);
    } else {
      console.warn("Missing initiation handler for:", autoPet.id);
    }
  });
}


function autoPetStartChattingPreConditioning (autoPet, coords) {
    const [x, y] = coords;
    autoPet.style.left = `calc(${x} * var(--unit-size))`;
    autoPet.style.top = `calc((${y + 1} * var(--unit-size)) - ${autoPet.offsetHeight}px)`;

    autoPetStartingActionSelection[autoPet.id] = autoPetStartChatting

    setPetZIndex(autoPet)
}

async function autoPetStartChatting (autoPet) {
    await playAnimationOnce(autoPet, "chats");
    if (editing) {
        setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
        return;
    }
    await playAnimationOnce(autoPet, "surprised");
    if (editing) {
        setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
        return;
    }
    autoPet._busy = false;
    ghostWanders(autoPet);
}

function maintainAutonomousPet (autoPet) {
    if (editing) return
    const actionDict = autoPetActionDict[autoPet._petType]?.maintainance;

    if (!actionDict) return;

    const functionName = pickWeightedRandom(actionDict);
    const handler = window[functionName];

    if (typeof handler === "function") {
      handler(autoPet);
    } else {
      console.warn("Missing initiation handler:", functionName);
    }
}

async function positionGhost(autoPet, coords) {
    const [x, y] = coords
    autoPet.style.left = `calc(${x} * var(--unit-size))`;
    autoPet.style.top = `calc((${y + 1} * var(--unit-size)) - ${autoPet.offsetHeight}px)`;
    setPetZIndex(autoPet)
}

async function randomlyPositionGhost(autoPet) {
    const suitableWalkingTiles = globalWalkabilityMap;
    const validCoords = findValidPlacements(suitableWalkingTiles, autoPet);

    if (validCoords.length === 0) {
        return;
    }

    // Pick a random coordinate
    const randomIndex = Math.floor(Math.random() * validCoords.length);
    const randomCoord = validCoords[randomIndex];
    const [x, y] = randomCoord
    autoPet.style.left = `calc(${x} * var(--unit-size))`;
    autoPet.style.top = `calc((${y + 1} * var(--unit-size)) - ${autoPet.offsetHeight}px)`;
    setPetZIndex(autoPet)
}

async function randomlyPositionGhostWithinVisiblePart(autoPet) {
    const suitableWalkingTiles = globalWalkabilityMap;
    let validCoords = findValidPlacements(suitableWalkingTiles, autoPet);

    if (validCoords.length !== 0) {
        visibleCoords = getVisibleTiles(validCoords);

        let randomCoord;
        if (visibleCoords.length !== 0) {
            const randomIndex = Math.floor(Math.random() * visibleCoords.length);
            randomCoord = visibleCoords[randomIndex];
        } else {
            const randomIndex = Math.floor(Math.random() * validCoords.length);
            randomCoord = validCoords[randomIndex];
        }
        const [x, y] = randomCoord;
        autoPet.style.left = `calc(${x} * var(--unit-size))`;
        autoPet.style.top = `calc((${y + 1} * var(--unit-size)) - ${autoPet.offsetHeight}px)`;
    }

    setPetZIndex(autoPet)
}

async function ghostWanders(autoPet) {
    await autoPetWalksAround(autoPet)
    if (editing) {
        setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
        return;
    }
    maintainAutonomousPet(autoPet);
}

async function ghostScares(autoPet) {
    await randomlyPositionGhostWithinVisiblePart(autoPet)
    if (editing) {
        setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
        return;
    }
    await playTransitionAnimation(autoPet, `scares`, null)
    if (editing) {
        setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
        return;
    }
    setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
    maintainAutonomousPet(autoPet);
}

async function ghostAppears(autoPet) {
    await randomlyPositionGhost(autoPet)
    if (editing) {
        setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
        return;
    }
    await playTransitionAnimation(autoPet, `appears`, null)
    if (editing) {
        setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
        return;
    }
    setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
    maintainAutonomousPet(autoPet);
}

async function ghostDisappears(autoPet) {
    await playTransitionAnimation(autoPet, `disappears`, null)
    if (editing) {
        setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
        return;
    }
    setObjectAnimation(autoPet, `${autoPet._petType}-invisible`);

    const actionName = pickWeightedRandom(ghost1ReappearActions);

    const action = window[actionName];
    const delayMs = 5000 + Math.random() * 5000;
    addAutoPetTimeoutTracker(() => action(autoPet), delayMs)
}

async function ghostLingers(autoPet) {
    setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
    const delayMs = 3000 + Math.random() * 6000;
    addAutoPetTimeoutTracker(() => maintainAutonomousPet(autoPet), delayMs)
}

async function ghostTogglesAppliances(autoPet) {
  const suitableAppliances = {
    'music-player': (obj) => toggleMusicPlayer(obj),
    'sink': (obj) => toggleSinkTap(obj),
    'oven': (obj) => toggleOven(obj),
    'washing-machine': (obj) => toggleWashingMachine(obj),
    'tv': (obj) => toggleTV(obj),
  }

  const selector = Object.keys(suitableAppliances)
      .map(cls => `.room-object.${cls}`)
      .join(', ');

  const objects = document.querySelectorAll(selector);

  if (!objects.length) {
    maintainAutonomousPet(autoPet);
  }

  const chosen = objects[Math.floor(Math.random() * objects.length)];
  const objectCoords = getObjectCoordinates(chosen.id);

  const objectWidth = Math.ceil(chosen.offsetWidth / unitSize);
  const objectHeight = Math.ceil(chosen.offsetHeight / unitSize);

  const petWidth = Math.ceil(autoPet.offsetWidth / unitSize);
  const petHeight = Math.ceil(autoPet.offsetHeight / unitSize);
  const petPos = getObjectCoordinates(autoPet.id);

  let targetCoords;
  
  let objectToTheRight = objectCoords[0] > petPos[0]
  // Check if object is to the right of the pet
  if (objectToTheRight) {
    // Object is to the right: use left edge minus half pet width
    targetCoords = [
      objectCoords[0] - Math.floor(petWidth / 2),
      objectCoords[1] - (Math.random() < 0.5 ? Math.floor(objectHeight / 2) : -1)
    ];
  } else {
    // Object is not to the right: use center coords
    targetCoords = [
      objectCoords[0] + Math.floor(objectWidth / 2),
      objectCoords[1] - (Math.random() < 0.5 ? Math.floor(objectHeight / 2) : -1)
    ];
  }

  let closestWalkableCoords = findClosestWalkablePosition(
      globalWalkabilityMap, 
      targetCoords[1],  // row first
      targetCoords[0],  // col second
      petWidth
  )
  closestWalkableCoords = [closestWalkableCoords.col, closestWalkableCoords.row]

  if (!endCoordsValidityChecker(petPos[0], petPos[1], closestWalkableCoords[0], closestWalkableCoords[1], autoPet.id, globalWalkabilityMap)) {
      setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
      maintainAutonomousPet(autoPet);
  }

  if (Math.random() < 0.5) {
    // 50% chance: Walk to the position
    await movePetToTile(autoPet, petPos, closestWalkableCoords);
    if (editing) {
        setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
        return;
    }
    let objectToTheRightCurrent = objectCoords[0] > petPos[0]
    if (objectToTheRightCurrent) {
        autoPet.classList.remove("pet-left");
        autoPet.classList.add("pet-right");
      }

      await playTransitionAnimation(autoPet, `haunting`, null);
      if (editing) {
          setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
          return;
      }
      toggleSelectedAppliance();
      setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
      maintainAutonomousPet(autoPet);
  } else {
    // 50% chance: Teleport to the position
    await playTransitionAnimation(autoPet, `disappears`, null);
    if (editing) {
        setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
        return;
    }
    setObjectAnimation(autoPet, `${autoPet._petType}-invisible`);

    const delayMs = 2000 + Math.random() * 2000;

    addAutoPetTimeoutTracker(async () => {
      if (editing) {
          setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
          return;
      }
      positionGhost(autoPet, closestWalkableCoords);
      if (objectToTheRight) {
        autoPet.classList.remove("pet-left");
        autoPet.classList.add("pet-right");
      }
      await playTransitionAnimation(autoPet, `appears`, null);
      if (editing) {
          setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
          return;
      }
      await playTransitionAnimation(autoPet, `haunting`, null);
      if (editing) {
          setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
          return;
      }
      toggleSelectedAppliance();
      setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
      maintainAutonomousPet(autoPet);
    }, delayMs);
  }

  return

  async function toggleSelectedAppliance() {
    for (const cls of Object.keys(suitableAppliances)) {
      if (chosen.classList.contains(cls)) {
        await suitableAppliances[cls](chosen);
        break;
      }
    }
  }
}

async function autoPetWalksAround(autoPet) {
    const suitableWalkingTiles = globalWalkabilityMap;
    const validCoords = findValidPlacements(suitableWalkingTiles, autoPet);

    if (validCoords.length === 0) {
        return;
    }

    const randomIndex = Math.floor(Math.random() * validCoords.length);
    const randomCoord = validCoords[randomIndex];
    const petPos = getObjectCoordinates(autoPet.id)

    if (!endCoordsValidityChecker(petPos[0], petPos[1], randomCoord[0], randomCoord[1], autoPet.id, suitableWalkingTiles)) {
        setObjectAnimation(autoPet, `${autoPet._petType}-stands-idle`);
        return
    }

    await movePetToTile(autoPet, petPos, randomCoord);

}