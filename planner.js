const INCHES_TO_CM = 2.54;

/* ---------------------------------
   PAGE ELEMENTS
--------------------------------- */

const inputs = {
    width: document.getElementById("squares-wide"),
    height: document.getElementById("squares-tall"),
    rounds: document.getElementById("rounds"),
    roundGrowth: document.getElementById("round-growth"),
    unit: document.getElementById("unit"),
    joinWidth: document.getElementById("join-width"),
    borderRounds: document.getElementById("border-rounds"),
    borderGrowth: document.getElementById("border-growth")
};

const output = {
    totalSquares: document.getElementById("total-squares"),
    squareSize: document.getElementById("square-size"),
    beforeBorder: document.getElementById("before-border"),
    finishedSize: document.getElementById("finished-size"),
    totalRounds: document.getElementById("total-rounds"),

    squareEquation: document.getElementById("square-equation"),
    widthEquation: document.getElementById("width-equation"),
    heightEquation: document.getElementById("height-equation"),
    borderEquation: document.getElementById("border-equation"),

    grid: document.getElementById("blanket-grid")
};

const colourControls = {
    designMode: document.getElementById("design-mode"),
    modeDescription: document.getElementById("mode-description"),

    paletteList: document.getElementById("palette-list"),
    addColour: document.getElementById("add-colour"),

    identicalOptions: document.getElementById("identical-options"),
    randomizedOptions: document.getElementById("randomized-options"),
    customOptions: document.getElementById("custom-options"),

    roundColourList: document.getElementById("round-colour-list"),

    balanceColours: document.getElementById("balance-colours"),
    preventRoundRepeats: document.getElementById(
        "prevent-round-repeats"
    ),
    avoidIdenticalSquares: document.getElementById(
        "avoid-identical-squares"
    ),
    avoidMatchingNeighbours: document.getElementById(
        "avoid-matching-neighbours"
    ),

    fixedOuterEnabled: document.getElementById(
        "fixed-outer-enabled"
    ),
    fixedOuterField: document.getElementById(
        "fixed-outer-field"
    ),
    fixedOuterColour: document.getElementById(
        "fixed-outer-colour"
    ),

    randomizeBlanket: document.getElementById(
        "randomize-blanket"
    ),

    selectedSquareMessage: document.getElementById(
        "selected-square-message"
    ),
    selectedSquareRounds: document.getElementById(
        "selected-square-rounds"
    )
};

/* ---------------------------------
   APP STATE
--------------------------------- */

let identicalRoundColours = [];
let blanketDesign = [];
let selectedSquareIndex = null;

let lastProjectShape = {
    width: 0,
    height: 0,
    rounds: 0
};

/* ---------------------------------
   GENERAL HELPERS
--------------------------------- */

function getNumber(input, minimum = 0) {
    const number = Number(input.value);

    if (!Number.isFinite(number)) {
        return minimum;
    }

    return Math.max(minimum, number);
}

function getWholeNumber(input, minimum = 0) {
    return Math.floor(
        getNumber(input, minimum)
    );
}

function roundMeasurement(number) {
    return Number(number.toFixed(2));
}

function convertMeasurement(amount, fromUnit) {
    if (fromUnit === "in") {
        return {
            primary: amount,
            primaryUnit: "in",
            secondary: amount * INCHES_TO_CM,
            secondaryUnit: "cm"
        };
    }

    return {
        primary: amount,
        primaryUnit: "cm",
        secondary: amount / INCHES_TO_CM,
        secondaryUnit: "in"
    };
}

function formatMeasurement(amount, unit) {
    const converted =
        convertMeasurement(amount, unit);

    return (
        `${roundMeasurement(converted.primary)} ` +
        `${converted.primaryUnit} / ` +
        `${roundMeasurement(converted.secondary)} ` +
        `${converted.secondaryUnit}`
    );
}

function formatDimensions(width, height, unit) {
    const convertedWidth =
        convertMeasurement(width, unit);

    const convertedHeight =
        convertMeasurement(height, unit);

    return (
        `${roundMeasurement(convertedWidth.primary)} × ` +
        `${roundMeasurement(convertedHeight.primary)} ` +
        `${convertedWidth.primaryUnit} / ` +
        `${roundMeasurement(convertedWidth.secondary)} × ` +
        `${roundMeasurement(convertedHeight.secondary)} ` +
        `${convertedWidth.secondaryUnit}`
    );
}

function cloneDesign(design) {
    return [...design];
}

/* ---------------------------------
   PROJECT CALCULATIONS
--------------------------------- */

function calculateProject() {
    const squaresWide =
        getWholeNumber(inputs.width, 1);

    const squaresTall =
        getWholeNumber(inputs.height, 1);

    const roundsPerSquare =
        getWholeNumber(inputs.rounds, 1);

    const roundGrowth =
        getNumber(inputs.roundGrowth);

    const joinWidth =
        getNumber(inputs.joinWidth);

    const borderRounds =
        getWholeNumber(inputs.borderRounds);

    const borderGrowth =
        getNumber(inputs.borderGrowth);

    const unit =
        inputs.unit.value;

    const squareSize =
        roundsPerSquare *
        roundGrowth *
        2;

    const horizontalJoinSpaces =
        Math.max(0, squaresWide - 1);

    const verticalJoinSpaces =
        Math.max(0, squaresTall - 1);

    const widthBeforeBorder =
        (squareSize * squaresWide) +
        (joinWidth * horizontalJoinSpaces);

    const heightBeforeBorder =
        (squareSize * squaresTall) +
        (joinWidth * verticalJoinSpaces);

    const borderAddedPerSide =
        borderRounds * borderGrowth;

    const totalBorderAdded =
        borderAddedPerSide * 2;

    const finishedWidth =
        widthBeforeBorder +
        totalBorderAdded;

    const finishedHeight =
        heightBeforeBorder +
        totalBorderAdded;

    const totalSquares =
        squaresWide * squaresTall;

    const totalSquareRounds =
        totalSquares * roundsPerSquare;

    return {
        squaresWide,
        squaresTall,
        roundsPerSquare,
        roundGrowth,
        joinWidth,
        borderRounds,
        borderGrowth,
        unit,

        squareSize,
        horizontalJoinSpaces,
        verticalJoinSpaces,

        widthBeforeBorder,
        heightBeforeBorder,

        borderAddedPerSide,
        totalBorderAdded,

        finishedWidth,
        finishedHeight,

        totalSquares,
        totalSquareRounds
    };
}

function updateSummary(project) {
    output.totalSquares.textContent =
        project.totalSquares.toLocaleString();

    output.squareSize.textContent =
        formatMeasurement(
            project.squareSize,
            project.unit
        );

    output.beforeBorder.textContent =
        formatDimensions(
            project.widthBeforeBorder,
            project.heightBeforeBorder,
            project.unit
        );

    output.finishedSize.textContent =
        formatDimensions(
            project.finishedWidth,
            project.finishedHeight,
            project.unit
        );

    output.totalRounds.textContent =
        project.totalSquareRounds.toLocaleString();
}

function updateEquations(project) {
    const unit = project.unit;

    output.squareEquation.textContent =
        `${project.roundsPerSquare} rounds × ` +
        `${roundMeasurement(project.roundGrowth)} ` +
        `${unit} growth × 2 sides = ` +
        `${roundMeasurement(project.squareSize)} ${unit}`;

    output.widthEquation.textContent =
        `(${project.squaresWide} squares × ` +
        `${roundMeasurement(project.squareSize)} ${unit}) + ` +
        `(${project.horizontalJoinSpaces} joins × ` +
        `${roundMeasurement(project.joinWidth)} ${unit}) = ` +
        `${roundMeasurement(project.widthBeforeBorder)} ` +
        `${unit} before border`;

    output.heightEquation.textContent =
        `(${project.squaresTall} squares × ` +
        `${roundMeasurement(project.squareSize)} ${unit}) + ` +
        `(${project.verticalJoinSpaces} joins × ` +
        `${roundMeasurement(project.joinWidth)} ${unit}) = ` +
        `${roundMeasurement(project.heightBeforeBorder)} ` +
        `${unit} before border`;

    output.borderEquation.textContent =
        `${project.borderRounds} border rounds × ` +
        `${roundMeasurement(project.borderGrowth)} ` +
        `${unit} growth × 2 sides = ` +
        `${roundMeasurement(project.totalBorderAdded)} ` +
        `${unit} added overall`;
}

/* ---------------------------------
   PALETTE
--------------------------------- */

function getPalette() {
    const rows =
        colourControls.paletteList.querySelectorAll(
            ".palette-row"
        );

    return [...rows].map((row, index) => {
        const colourInput =
            row.querySelector(".palette-colour");

        const nameInput =
            row.querySelector(".palette-name");

        return {
            id: index,
            colour: colourInput.value,
            name:
                nameInput.value.trim() ||
                `Colour ${index + 1}`
        };
    });
}

function createPaletteRow(
    colour = "#8d5f72",
    name = "New Colour"
) {
    const row =
        document.createElement("div");

    row.className = "palette-row";

    const colourInput =
        document.createElement("input");

    colourInput.className =
        "palette-colour";

    colourInput.type = "color";
    colourInput.value = colour;
    colourInput.setAttribute(
        "aria-label",
        "Colour swatch"
    );

    const nameInput =
        document.createElement("input");

    nameInput.className =
        "palette-name";

    nameInput.type = "text";
    nameInput.value = name;
    nameInput.setAttribute(
        "aria-label",
        "Colour name"
    );

    const removeButton =
        document.createElement("button");

    removeButton.className =
        "remove-colour";

    removeButton.type = "button";
    removeButton.textContent = "Remove";

    removeButton.addEventListener(
        "click",
        () => {
            const rows =
                colourControls.paletteList.querySelectorAll(
                    ".palette-row"
                );

            if (rows.length <= 1) {
                return;
            }

            row.remove();
            handlePaletteChange();
        }
    );

    colourInput.addEventListener(
        "input",
        handlePaletteChange
    );

    nameInput.addEventListener(
        "input",
        handlePaletteChange
    );

    row.append(
        colourInput,
        nameInput,
        removeButton
    );

    return row;
}

function connectExistingPaletteRows() {
    const rows =
        colourControls.paletteList.querySelectorAll(
            ".palette-row"
        );

    rows.forEach(row => {
        const colourInput =
            row.querySelector(".palette-colour");

        const nameInput =
            row.querySelector(".palette-name");

        const removeButton =
            row.querySelector(".remove-colour");

        colourInput.addEventListener(
            "input",
            handlePaletteChange
        );

        nameInput.addEventListener(
            "input",
            handlePaletteChange
        );

        removeButton.addEventListener(
            "click",
            () => {
                const currentRows =
                    colourControls.paletteList.querySelectorAll(
                        ".palette-row"
                    );

                if (currentRows.length <= 1) {
                    return;
                }

                row.remove();
                handlePaletteChange();
            }
        );
    });
}

function updateRemoveButtons() {
    const rows =
        colourControls.paletteList.querySelectorAll(
            ".palette-row"
        );

    rows.forEach(row => {
        const button =
            row.querySelector(".remove-colour");

        button.disabled =
            rows.length <= 1;
    });
}

function handlePaletteChange() {
    updateRemoveButtons();
    updateIdenticalRoundControls();
    updateFixedOuterOptions();

    const project =
        calculateProject();

    const mode =
        colourControls.designMode.value;

    if (mode === "identical") {
        applyIdenticalDesign(project);
    }

    if (mode === "randomized") {
        randomizeBlanket(project);
    }

    if (mode === "custom") {
        repairCustomDesign(project);
    }

    buildBlanketGrid(project);
    updateCustomEditor(project);
}

/* ---------------------------------
   ROUND COLOUR CONTROLS
--------------------------------- */

function createColourOptions(
    select,
    selectedColour
) {
    const palette =
        getPalette();

    select.innerHTML = "";

    palette.forEach(paletteColour => {
        const option =
            document.createElement("option");

        option.value =
            paletteColour.colour;

        option.textContent =
            paletteColour.name;

        if (
            paletteColour.colour ===
            selectedColour
        ) {
            option.selected = true;
        }

        select.appendChild(option);
    });

    if (
        !palette.some(
            paletteColour =>
                paletteColour.colour ===
                selectedColour
        )
    ) {
        select.value =
            palette[0]?.colour || "#8d5f72";
    }
}

function updateIdenticalRoundControls() {
    const project =
        calculateProject();

    const palette =
        getPalette();

    if (palette.length === 0) {
        return;
    }

    while (
        identicalRoundColours.length <
        project.roundsPerSquare
    ) {
        const nextColour =
            palette[
                identicalRoundColours.length %
                palette.length
            ].colour;

        identicalRoundColours.push(
            nextColour
        );
    }

    identicalRoundColours =
        identicalRoundColours.slice(
            0,
            project.roundsPerSquare
        );

    identicalRoundColours =
        identicalRoundColours.map(
            (colour, index) => {
                const stillExists =
                    palette.some(
                        paletteColour =>
                            paletteColour.colour === colour
                    );

                if (stillExists) {
                    return colour;
                }

                return palette[
                    index % palette.length
                ].colour;
            }
        );

    colourControls.roundColourList.innerHTML =
        "";

    identicalRoundColours.forEach(
        (colour, roundIndex) => {
            const row =
                document.createElement("div");

            row.className =
                "round-colour-row";

            const label =
                document.createElement("span");

            label.textContent =
                `Round ${roundIndex + 1}`;

            const select =
                document.createElement("select");

            createColourOptions(
                select,
                colour
            );

            select.addEventListener(
                "change",
                () => {
                    identicalRoundColours[
                        roundIndex
                    ] = select.value;

                    const currentProject =
                        calculateProject();

                    applyIdenticalDesign(
                        currentProject
                    );

                    buildBlanketGrid(
                        currentProject
                    );
                }
            );

            row.append(
                label,
                select
            );

            colourControls.roundColourList.appendChild(
                row
            );
        }
    );
}

function updateFixedOuterOptions() {
    const selectedValue =
        colourControls.fixedOuterColour.value;

    createColourOptions(
        colourControls.fixedOuterColour,
        selectedValue
    );
}

/* ---------------------------------
   DESIGN MODES
--------------------------------- */

function applyIdenticalDesign(project) {
    blanketDesign = [];

    for (
        let index = 0;
        index < project.totalSquares;
        index++
    ) {
        blanketDesign.push(
            cloneDesign(
                identicalRoundColours
            )
        );
    }
}

function getRandomSquareDesign(
    project,
    colourUsage
) {
    const palette =
        getPalette();

    const colours =
        palette.map(item => item.colour);

    const design = [];

    for (
        let roundIndex = 0;
        roundIndex < project.roundsPerSquare;
        roundIndex++
    ) {
        const isOuterRound =
            roundIndex ===
            project.roundsPerSquare - 1;

        if (
            isOuterRound &&
            colourControls.fixedOuterEnabled.checked
        ) {
            const fixedColour =
                colourControls.fixedOuterColour.value;

            design.push(fixedColour);

            colourUsage[fixedColour] =
                (colourUsage[fixedColour] || 0) + 1;

            continue;
        }

        let availableColours =
            [...colours];

        if (
            colourControls.preventRoundRepeats.checked
        ) {
            const unusedColours =
                availableColours.filter(
                    colour =>
                        !design.includes(colour)
                );

            if (unusedColours.length > 0) {
                availableColours =
                    unusedColours;
            }
        }

        let chosenColour;

        if (
            colourControls.balanceColours.checked
        ) {
            const lowestUsage =
                Math.min(
                    ...availableColours.map(
                        colour =>
                            colourUsage[colour] || 0
                    )
                );

            const leastUsed =
                availableColours.filter(
                    colour =>
                        (colourUsage[colour] || 0) ===
                        lowestUsage
                );

            chosenColour =
                leastUsed[
                    Math.floor(
                        Math.random() *
                        leastUsed.length
                    )
                ];
        } else {
            chosenColour =
                availableColours[
                    Math.floor(
                        Math.random() *
                        availableColours.length
                    )
                ];
        }

        design.push(chosenColour);

        colourUsage[chosenColour] =
            (colourUsage[chosenColour] || 0) + 1;
    }

    return design;
}

function designsMatch(first, second) {
    if (!first || !second) {
        return false;
    }

    if (first.length !== second.length) {
        return false;
    }

    return first.every(
        (colour, index) =>
            colour === second[index]
    );
}

function randomizeBlanket(project) {
    const palette =
        getPalette();

    if (palette.length === 0) {
        return;
    }

    const colourUsage = {};

    palette.forEach(item => {
        colourUsage[item.colour] = 0;
    });

    blanketDesign = [];

    const usedDesignKeys =
        new Set();

    for (
        let squareIndex = 0;
        squareIndex < project.totalSquares;
        squareIndex++
    ) {
        let design;
        let attempts = 0;

        do {
            design =
                getRandomSquareDesign(
                    project,
                    colourUsage
                );

            attempts++;
        } while (
            attempts < 80 &&
            !isRandomDesignAllowed(
                design,
                squareIndex,
                project,
                usedDesignKeys
            )
        );

        blanketDesign.push(design);

        usedDesignKeys.add(
            design.join("|")
        );
    }
}

function isRandomDesignAllowed(
    design,
    squareIndex,
    project,
    usedDesignKeys
) {
    if (
        colourControls.avoidIdenticalSquares.checked &&
        usedDesignKeys.has(design.join("|"))
    ) {
        return false;
    }

    if (
        !colourControls.avoidMatchingNeighbours.checked
    ) {
        return true;
    }

    const column =
        squareIndex % project.squaresWide;

    const leftIndex =
        column > 0
            ? squareIndex - 1
            : null;

    const aboveIndex =
        squareIndex >= project.squaresWide
            ? squareIndex - project.squaresWide
            : null;

    if (
        leftIndex !== null &&
        designsMatch(
            design,
            blanketDesign[leftIndex]
        )
    ) {
        return false;
    }

    if (
        aboveIndex !== null &&
        designsMatch(
            design,
            blanketDesign[aboveIndex]
        )
    ) {
        return false;
    }

    return true;
}

function repairCustomDesign(project) {
    const palette =
        getPalette();

    const defaultColour =
        palette[0]?.colour || "#8d5f72";

    const repairedDesign = [];

    for (
        let squareIndex = 0;
        squareIndex < project.totalSquares;
        squareIndex++
    ) {
        const existing =
            blanketDesign[squareIndex] || [];

        const squareDesign = [];

        for (
            let roundIndex = 0;
            roundIndex < project.roundsPerSquare;
            roundIndex++
        ) {
            squareDesign.push(
                existing[roundIndex] ||
                identicalRoundColours[roundIndex] ||
                defaultColour
            );
        }

        repairedDesign.push(squareDesign);
    }

    blanketDesign =
        repairedDesign;

    if (
        selectedSquareIndex !== null &&
        selectedSquareIndex >=
        project.totalSquares
    ) {
        selectedSquareIndex = null;
    }
}

function updateDesignMode() {
    const mode =
        colourControls.designMode.value;

    colourControls.identicalOptions.hidden =
        mode !== "identical";

    colourControls.randomizedOptions.hidden =
        mode !== "randomized";

    colourControls.customOptions.hidden =
        mode !== "custom";

    const descriptions = {
        identical:
            "Every square uses the same colours in the same round order.",

        randomized:
            "Square colour orders are generated from your palette and rules.",

        custom:
            "Tap any square in the preview to edit its individual round colours."
    };

    colourControls.modeDescription.textContent =
        descriptions[mode];

    const project =
        calculateProject();

    if (mode === "identical") {
        applyIdenticalDesign(project);
    }

    if (mode === "randomized") {
        randomizeBlanket(project);
    }

    if (mode === "custom") {
        repairCustomDesign(project);
    }

    buildBlanketGrid(project);
    updateCustomEditor(project);
}

/* ---------------------------------
   CUSTOM SQUARE EDITOR
--------------------------------- */

function selectSquare(index, project) {
    if (
        colourControls.designMode.value !==
        "custom"
    ) {
        return;
    }

    selectedSquareIndex = index;

    buildBlanketGrid(project);
    updateCustomEditor(project);
}

function updateCustomEditor(project) {
    colourControls.selectedSquareRounds.innerHTML =
        "";

    if (
        colourControls.designMode.value !==
        "custom"
    ) {
        return;
    }

    if (selectedSquareIndex === null) {
        colourControls.selectedSquareMessage.textContent =
            "No square selected.";

        return;
    }

    const squareDesign =
        blanketDesign[selectedSquareIndex];

    if (!squareDesign) {
        colourControls.selectedSquareMessage.textContent =
            "No square selected.";

        return;
    }

    colourControls.selectedSquareMessage.textContent =
        `Editing Square ${selectedSquareIndex + 1}`;

    squareDesign.forEach(
        (colour, roundIndex) => {
            const row =
                document.createElement("div");

            row.className =
                "round-colour-row";

            const label =
                document.createElement("span");

            label.textContent =
                `Round ${roundIndex + 1}`;

            const select =
                document.createElement("select");

            createColourOptions(
                select,
                colour
            );

            select.addEventListener(
                "change",
                () => {
                    blanketDesign[
                        selectedSquareIndex
                    ][roundIndex] =
                        select.value;

                    buildBlanketGrid(project);
                }
            );

            row.append(
                label,
                select
            );

            colourControls.selectedSquareRounds.appendChild(
                row
            );
        }
    );
}

/* ---------------------------------
   BLANKET PREVIEW
--------------------------------- */

function createSquareRound(
    colour,
    roundIndex,
    totalRounds
) {
    const layer =
        document.createElement("div");

    layer.className =
        "square-round";

    const distanceFromOuter =
        totalRounds -
        roundIndex -
        1;

    const inset =
        (distanceFromOuter / totalRounds) *
        46;

    layer.style.inset =
        `${inset}%`;

    layer.style.background =
        colour;

    /*
    Inner rounds need to sit above outer rounds.
    */
    layer.style.zIndex =
        String(totalRounds - roundIndex);

    return layer;
}

function buildBlanketGrid(project) {
    output.grid.innerHTML = "";

    /*
    Explicit columns work reliably in mobile Safari.
    */
    output.grid.style.gridTemplateColumns =
        `repeat(${project.squaresWide}, minmax(0, 1fr))`;

    for (
        let squareIndex = 0;
        squareIndex < project.totalSquares;
        squareIndex++
    ) {
        const square =
            document.createElement("button");

        square.type = "button";
        square.className =
            "blanket-square";

        if (
            selectedSquareIndex ===
            squareIndex
        ) {
            square.classList.add(
                "selected"
            );
        }

        square.setAttribute(
            "aria-label",
            `Square ${squareIndex + 1}`
        );

        const design =
            blanketDesign[squareIndex] ||
            identicalRoundColours;

        for (
            let roundIndex =
                design.length - 1;
            roundIndex >= 0;
            roundIndex--
        ) {
            const layer =
                createSquareRound(
                    design[roundIndex],
                    roundIndex,
                    design.length
                );

            square.appendChild(layer);
        }

        square.addEventListener(
            "click",
            () => {
                selectSquare(
                    squareIndex,
                    project
                );
            }
        );

        output.grid.appendChild(square);
    }
}

/* ---------------------------------
   PROJECT UPDATES
--------------------------------- */

function projectShapeChanged(project) {
    return (
        project.squaresWide !==
            lastProjectShape.width ||
        project.squaresTall !==
            lastProjectShape.height ||
        project.roundsPerSquare !==
            lastProjectShape.rounds
    );
}

function rememberProjectShape(project) {
    lastProjectShape = {
        width: project.squaresWide,
        height: project.squaresTall,
        rounds: project.roundsPerSquare
    };
}

function updatePlanner() {
    const project =
        calculateProject();

    updateSummary(project);
    updateEquations(project);

    updateIdenticalRoundControls();
    updateFixedOuterOptions();

    if (projectShapeChanged(project)) {
        const mode =
            colourControls.designMode.value;

        if (mode === "identical") {
            applyIdenticalDesign(project);
        }

        if (mode === "randomized") {
            randomizeBlanket(project);
        }

        if (mode === "custom") {
            repairCustomDesign(project);
        }

        rememberProjectShape(project);
    }

    buildBlanketGrid(project);
    updateCustomEditor(project);
}

/* ---------------------------------
   EVENT LISTENERS
--------------------------------- */

Object.values(inputs).forEach(input => {
    input.addEventListener(
        "input",
        updatePlanner
    );

    input.addEventListener(
        "change",
        updatePlanner
    );
});

colourControls.designMode.addEventListener(
    "change",
    updateDesignMode
);

colourControls.addColour.addEventListener(
    "click",
    () => {
        const row =
            createPaletteRow();

        colourControls.paletteList.appendChild(
            row
        );

        handlePaletteChange();
    }
);

colourControls.fixedOuterEnabled.addEventListener(
    "change",
    () => {
        colourControls.fixedOuterField.hidden =
            !colourControls.fixedOuterEnabled.checked;

        const project =
            calculateProject();

        randomizeBlanket(project);
        buildBlanketGrid(project);
    }
);

colourControls.fixedOuterColour.addEventListener(
    "change",
    () => {
        const project =
            calculateProject();

        randomizeBlanket(project);
        buildBlanketGrid(project);
    }
);

colourControls.randomizeBlanket.addEventListener(
    "click",
    () => {
        const project =
            calculateProject();

        randomizeBlanket(project);
        buildBlanketGrid(project);
    }
);

[
    colourControls.balanceColours,
    colourControls.preventRoundRepeats,
    colourControls.avoidIdenticalSquares,
    colourControls.avoidMatchingNeighbours
].forEach(control => {
    control.addEventListener(
        "change",
        () => {
            const project =
                calculateProject();

            randomizeBlanket(project);
            buildBlanketGrid(project);
        }
    );
});

/* ---------------------------------
   STARTUP
--------------------------------- */

connectExistingPaletteRows();
updateRemoveButtons();
updateIdenticalRoundControls();
updateFixedOuterOptions();

colourControls.fixedOuterField.hidden =
    !colourControls.fixedOuterEnabled.checked;

const initialProject =
    calculateProject();

applyIdenticalDesign(initialProject);
rememberProjectShape(initialProject);
updateSummary(initialProject);
updateEquations(initialProject);
buildBlanketGrid(initialProject);