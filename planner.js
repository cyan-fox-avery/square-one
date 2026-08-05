const INCHES_TO_CM = 2.54;

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

function getNumber(input, minimum = 0) {
    const number = Number(input.value);

    if (!Number.isFinite(number)) {
        return minimum;
    }

    return Math.max(minimum, number);
}

function getWholeNumber(input, minimum = 0) {
    return Math.floor(getNumber(input, minimum));
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
    const converted = convertMeasurement(amount, unit);

    return (
        `${roundMeasurement(converted.primary)} ${converted.primaryUnit}` +
        ` / ${roundMeasurement(converted.secondary)} ${converted.secondaryUnit}`
    );
}

function formatDimensions(width, height, unit) {
    const convertedWidth = convertMeasurement(width, unit);
    const convertedHeight = convertMeasurement(height, unit);

    return (
        `${roundMeasurement(convertedWidth.primary)} × ` +
        `${roundMeasurement(convertedHeight.primary)} ` +
        `${convertedWidth.primaryUnit}` +
        ` / ` +
        `${roundMeasurement(convertedWidth.secondary)} × ` +
        `${roundMeasurement(convertedHeight.secondary)} ` +
        `${convertedWidth.secondaryUnit}`
    );
}

function calculateProject() {
    const squaresWide = getWholeNumber(inputs.width, 1);
    const squaresTall = getWholeNumber(inputs.height, 1);
    const roundsPerSquare = getWholeNumber(inputs.rounds, 1);

    const roundGrowth = getNumber(inputs.roundGrowth);
    const joinWidth = getNumber(inputs.joinWidth);

    const borderRounds = getWholeNumber(inputs.borderRounds);
    const borderGrowth = getNumber(inputs.borderGrowth);

    const unit = inputs.unit.value;

    /*
    Each round grows outward from every edge.

    If one round adds 0.5 inches outward from one edge,
    it adds 1 inch to the square's full width:
    0.5 inches on the left + 0.5 inches on the right.
    */
    const squareSize =
        roundsPerSquare * roundGrowth * 2;

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
        widthBeforeBorder + totalBorderAdded;

    const finishedHeight =
        heightBeforeBorder + totalBorderAdded;

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
        `${roundMeasurement(project.roundGrowth)} ${unit} growth × 2 sides ` +
        `= ${roundMeasurement(project.squareSize)} ${unit}`;

    output.widthEquation.textContent =
        `(${project.squaresWide} squares × ` +
        `${roundMeasurement(project.squareSize)} ${unit}) + ` +
        `(${project.horizontalJoinSpaces} joins × ` +
        `${roundMeasurement(project.joinWidth)} ${unit}) ` +
        `= ${roundMeasurement(project.widthBeforeBorder)} ${unit} before border`;

    output.heightEquation.textContent =
        `(${project.squaresTall} squares × ` +
        `${roundMeasurement(project.squareSize)} ${unit}) + ` +
        `(${project.verticalJoinSpaces} joins × ` +
        `${roundMeasurement(project.joinWidth)} ${unit}) ` +
        `= ${roundMeasurement(project.heightBeforeBorder)} ${unit} before border`;

    output.borderEquation.textContent =
        `${project.borderRounds} border rounds × ` +
        `${roundMeasurement(project.borderGrowth)} ${unit} growth × 2 sides ` +
        `= ${roundMeasurement(project.totalBorderAdded)} ${unit} added overall`;
}

function buildBlanketGrid(project) {
    output.grid.innerHTML = "";

    output.grid.style.setProperty(
        "--columns",
        project.squaresWide
    );

    for (
        let squareNumber = 0;
        squareNumber < project.totalSquares;
        squareNumber++
    ) {
        const square =
            document.createElement("div");

        square.className = "blanket-square";

        square.setAttribute(
            "aria-label",
            `Square ${squareNumber + 1}`
        );

        output.grid.appendChild(square);
    }
}

function updatePlanner() {
    const project = calculateProject();

    updateSummary(project);
    updateEquations(project);
    buildBlanketGrid(project);
}

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

updatePlanner();