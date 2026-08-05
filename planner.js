const inputs = {
    width: document.getElementById("squares-wide"),
    height: document.getElementById("squares-tall"),
    rounds: document.getElementById("rounds"),
    stitchHeight: document.getElementById("stitch-height"),
    border: document.getElementById("border-width"),
    unit: document.getElementById("unit")
};

const output = {
    totalSquares: document.getElementById("total-squares"),
    blanketWidth: document.getElementById("blanket-width"),
    blanketHeight: document.getElementById("blanket-height"),
    totalRounds: document.getElementById("total-rounds"),
    grid: document.getElementById("blanket-grid")
};

function value(input) {
    return Number(input.value) || 0;
}

function calculateSquareSize() {
    return value(inputs.rounds) * value(inputs.stitchHeight);
}

function updateSummary() {

    const squaresWide = value(inputs.width);
    const squaresTall = value(inputs.height);

    const totalSquares =
        squaresWide * squaresTall;

    const squareSize =
        calculateSquareSize();

    const border =
        value(inputs.border);

    const blanketWidth =
        (squareSize * squaresWide) + (border * 2);

    const blanketHeight =
        (squareSize * squaresTall) + (border * 2);

    const totalRounds =
        totalSquares * value(inputs.rounds);

    output.totalSquares.textContent =
        totalSquares;

    output.blanketWidth.textContent =
        `${blanketWidth.toFixed(2)} ${inputs.unit.value}`;

    output.blanketHeight.textContent =
        `${blanketHeight.toFixed(2)} ${inputs.unit.value}`;

    output.totalRounds.textContent =
        totalRounds.toLocaleString();
}

function buildBlanketGrid() {

    const squaresWide =
        value(inputs.width);

    const squaresTall =
        value(inputs.height);

    output.grid.innerHTML = "";

    output.grid.style.setProperty(
        "--columns",
        squaresWide
    );

    const totalSquares =
        squaresWide * squaresTall;

    for (
        let square = 0;
        square < totalSquares;
        square++
    ) {

        const div =
            document.createElement("div");

        div.className =
            "blanket-square";

        output.grid.appendChild(div);
    }
}

function updatePlanner() {
    updateSummary();
    buildBlanketGrid();
}

Object.values(inputs).forEach(input => {

    input.addEventListener(
        "input",
        updatePlanner
    );

});

updatePlanner();