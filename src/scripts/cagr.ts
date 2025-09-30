import * as echarts from "echarts";
// =========================================================================
// TYPE DEFINITIONS
// =========================================================================

interface FormValues {
  cagr: number | null;
  multiplier: number | null;
  years: number | null;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}

interface CalculationResult {
  value: number;
  formula: string;
  explanation: string;
}

interface VerificationResult {
  isCorrect: boolean;
  expected: number;
  difference: number;
  tolerance: number;
}

interface ChartDataPoint {
  x: number;
  y: number;
  label: string;
}

type CalculationType = "zero" | "one" | "two" | "three";
type MessageType = "info" | "success" | "error" | "warning";
type InputType = "cagr" | "multiplier" | "years";

// =========================================================================
// GLOBAL VARIABLES
// =========================================================================

let chartInstance: any = null;
let elements: {
  form: HTMLFormElement | null;
  cagrInput: HTMLInputElement | null;
  multiplierInput: HTMLInputElement | null;
  yearsInput: HTMLInputElement | null;
  calculateBtn: HTMLButtonElement | null;
  resultsContainer: HTMLElement | null;
  chartContainer: HTMLElement | null;
  messageContainer: HTMLElement | null;
  tooltip: HTMLElement | null;
} = {
  form: null,
  cagrInput: null,
  multiplierInput: null,
  yearsInput: null,
  calculateBtn: null,
  resultsContainer: null,
  chartContainer: null,
  messageContainer: null,
  tooltip: null,
};

// =========================================================================
// UTILITY FUNCTIONS
// =========================================================================

function formatAsPercentage(decimal: number): string {
  return (decimal * 100).toFixed(2) + "%";
}

function formatAsMultiplier(value: number): string {
  return value.toFixed(2) + "×";
}

function formatAsYears(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return rounded + (rounded === 1 ? " year" : " years");
}

function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

// =========================================================================
// INPUT VALIDATION & MANAGEMENT
// =========================================================================

function validateInputs(
  cagr: number | null,
  multiplier: number | null,
  years: number | null
): ValidationResult {
  const errors: ValidationError[] = [];

  if (cagr !== null) {
    if (isNaN(cagr) || cagr < -100 || cagr > 500) {
      errors.push({
        field: "cagr",
        message: "CAGR must be between -100% and 500%",
      });
    }
  }

  if (multiplier !== null) {
    if (isNaN(multiplier) || multiplier < 0.01 || multiplier > 1000) {
      errors.push({
        field: "multiplier",
        message: "Multiplier must be between 0.01 and 1000",
      });
    }
  }

  if (years !== null) {
    if (isNaN(years) || years < 1 || years > 1000 || !Number.isInteger(years)) {
      errors.push({
        field: "years",
        message: "Years must be an integer between 1 and 1000",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

function getFormValues(): FormValues {
  const cagrValue = elements.cagrInput?.value.trim();
  const multiplierValue = elements.multiplierInput?.value.trim();
  const yearsValue = elements.yearsInput?.value.trim();

  return {
    cagr: cagrValue === "" ? null : parseFloat(cagrValue as string),
    multiplier:
      multiplierValue === "" ? null : parseFloat(multiplierValue as string),
    years: yearsValue === "" ? null : parseInt(yearsValue as string, 10),
  };
}

function clearResults(): void {
  if (elements.resultsContainer) {
    elements.resultsContainer.classList.add("hidden");
    elements.resultsContainer.innerHTML = "";
  }

  if (elements.chartContainer) {
    elements.chartContainer.classList.add("hidden");
    destroyExistingChart();
  }
}

function showFieldError(fieldId: string, message: string): void {
  const errorElement = document.getElementById(`${fieldId}-error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

function clearFieldErrors(): void {
  const errorElements = document.querySelectorAll(".field-error");
  errorElements.forEach((element) => {
    (element as HTMLElement).textContent = "";
    (element as HTMLElement).style.display = "none";
  });
}

// =========================================================================
// MATHEMATICAL CALCULATIONS
// =========================================================================

function calculateCAGR(multiplier: number, years: number): number {
  if (multiplier <= 0 || years <= 0) {
    throw new Error("Multiplier and years must be positive");
  }
  return Math.pow(multiplier, 1 / years) - 1;
}

function calculateMultiplier(cagr: number, years: number): number {
  if (years <= 0) {
    throw new Error("Years must be positive");
  }
  if (cagr <= -1) {
    throw new Error("CAGR must be greater than -100%");
  }
  return Math.pow(1 + cagr / 100, years);
}

function calculateYears(cagr: number, multiplier: number): number {
  if (multiplier <= 0) {
    throw new Error("Multiplier must be positive");
  }
  if (cagr <= -1) {
    throw new Error("CAGR must be greater than -100%");
  }
  if (Math.abs(cagr) < 0.0001) {
    throw new Error("CAGR cannot be zero for years calculation");
  }

  const cagrDecimal = cagr / 100;
  return Math.log(multiplier) / Math.log(1 + cagrDecimal);
}

function calculateMissingValue(
  input1: number,
  input2: number,
  type: string
): CalculationResult {
  try {
    let value: number;
    let formula: string;
    let explanation: string;

    switch (type) {
      case "cagr-years": // Calculate multiplier
        value = calculateMultiplier(input1, input2);
        formula = `Multiplier = (1 + ${input1}%)^${input2}`;
        explanation = `With a CAGR of ${input1}% over ${input2} years, the investment multiplier is ${formatAsMultiplier(value)}.`;
        break;

      case "multiplier-years": // Calculate CAGR
        value = calculateCAGR(input1, input2) * 100;
        formula = `CAGR = (${formatAsMultiplier(input1)})^(1/${input2}) - 1`;
        explanation = `With a ${formatAsMultiplier(input1)} multiplier over ${input2} years, the CAGR is ${formatAsPercentage(value / 100)}.`;
        break;

      case "cagr-multiplier": // Calculate years
        value = calculateYears(input1, input2);
        formula = `Years = ln(${formatAsMultiplier(input2)}) / ln(1 + ${input1}%)`;
        explanation = `To achieve a ${formatAsMultiplier(input2)} multiplier with ${input1}% CAGR, it takes ${formatAsYears(value)}.`;
        break;

      default:
        throw new Error("Invalid calculation type");
    }

    return { value, formula, explanation };
  } catch (error) {
    throw new Error(`Calculation error: ${(error as Error).message}`);
  }
}

function verifyCAGRCorrectness(
  cagr: number,
  multiplier: number,
  years: number
): VerificationResult {
  const tolerance = 0.01; // 1% tolerance
  const expectedCAGR = calculateCAGR(multiplier, years) * 100;
  const difference = Math.abs(cagr - expectedCAGR);
  const isCorrect = difference <= tolerance;

  return {
    isCorrect,
    expected: expectedCAGR,
    difference,
    tolerance,
  };
}

function isRealisticValue(value: number, type: InputType): boolean {
  switch (type) {
    case "cagr":
      return value >= -50 && value <= 100; // Realistic CAGR range
    case "multiplier":
      return value >= 0.1 && value <= 100; // Realistic multiplier range
    case "years":
      return value >= 1 && value <= 50; // Realistic investment horizon
    default:
      return true;
  }
}

// =========================================================================
// CHART GENERATION & VISUALIZATION
// =========================================================================

function initializeChart(): any {
  const chartContainer = elements.chartContainer;
  if (!chartContainer) {
    throw new Error("Chart container not found");
  }

  return echarts.init(chartContainer);
}

function generateGraphData(
  fixedValue: number,
  type: InputType
): ChartDataPoint[] {
  const dataPoints: ChartDataPoint[] = [];

  try {
    switch (type) {
      case "cagr": // CAGR fixed, plot Years vs Multiplier
        for (let years = 1; years <= 30; years++) {
          const multiplier = calculateMultiplier(fixedValue, years);
          if (multiplier <= 1000) {
            // Reasonable limit
            dataPoints.push({
              x: years,
              y: multiplier,
              label: `${years} years: ${formatAsMultiplier(multiplier)}`,
            });
          }
        }
        break;

      case "multiplier": // Multiplier fixed, plot Years vs CAGR
        for (let years = 1; years <= 50; years++) {
          try {
            const cagr = calculateCAGR(fixedValue, years) * 100;
            if (cagr >= -50 && cagr <= 100) {
              // Reasonable CAGR range
              dataPoints.push({
                x: years,
                y: cagr,
                label: `${years} years: ${formatAsPercentage(cagr / 100)}`,
              });
            }
          } catch (e) {
            // Skip invalid calculations
          }
        }
        break;

      case "years": // Years fixed, plot CAGR vs Multiplier
        for (let cagr = -20; cagr <= 50; cagr += 0.5) {
          try {
            const multiplier = calculateMultiplier(cagr, fixedValue);
            if (multiplier >= 0.1 && multiplier <= 100) {
              // Reasonable multiplier range
              dataPoints.push({
                x: cagr,
                y: multiplier,
                label: `${formatAsPercentage(cagr / 100)}: ${formatAsMultiplier(multiplier)}`,
              });
            }
          } catch (e) {
            // Skip invalid calculations
          }
        }
        break;
    }
  } catch (error) {
    console.error("Error generating graph data:", error);
  }

  return dataPoints;
}

function renderInteractiveGraph(
  data: ChartDataPoint[],
  chartType: InputType,
  fixedValue: number
): void {
  if (!elements.chartContainer) return;

  destroyExistingChart();

  try {
    chartInstance = initializeChart();

    let title: string;
    let xAxisName: string;
    let yAxisName: string;

    switch (chartType) {
      case "cagr":
        title = `Investment Growth with ${formatAsPercentage(fixedValue / 100)} CAGR`;
        xAxisName = "Years";
        yAxisName = "Multiplier";
        break;
      case "multiplier":
        title = `CAGR Required for ${formatAsMultiplier(fixedValue)} Growth`;
        xAxisName = "Years";
        yAxisName = "CAGR (%)";
        break;
      case "years":
        title = `Growth Potential over ${formatAsYears(fixedValue)}`;
        xAxisName = "CAGR (%)";
        yAxisName = "Multiplier";
        break;
      default:
        title = "Investment Analysis";
        xAxisName = "X";
        yAxisName = "Y";
    }

    const option = {
      title: {
        text: title,
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      tooltip: {
        trigger: "axis",
        formatter: function (params: any) {
          const point = params[0];
          return point.data.label || `${point.name}: ${point.value}`;
        },
      },
      grid: {
        left: "10%",
        right: "10%",
        bottom: "15%",
        top: "20%",
        containLabel: true,
      },
      xAxis: {
        name: xAxisName,
        nameLocation: "middle",
        nameGap: 30,
        type: "value",
        axisLabel: {
          formatter:
            chartType === "cagr" || chartType === "multiplier"
              ? "{value}"
              : "{value}%",
        },
      },
      yAxis: {
        name: yAxisName,
        nameLocation: "middle",
        nameGap: 50,
        type: "value",
        axisLabel: {
          formatter:
            chartType === "years"
              ? "{value}×"
              : chartType === "multiplier"
                ? "{value}%"
                : "{value}×",
        },
      },
      series: [
        {
          data: data.map((point) => ({
            value: [point.x, point.y],
            label: point.label,
          })),
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: {
            width: 3,
            color: "#2563eb",
          },
          itemStyle: {
            color: "#2563eb",
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(37, 99, 235, 0.3)" },
                { offset: 1, color: "rgba(37, 99, 235, 0.05)" },
              ],
            },
          },
        },
      ],
    };

    chartInstance.setOption(option);

    // Make chart responsive
    const handleResize = debounce(() => {
      if (chartInstance) {
        chartInstance.resize();
      }
    }, 250);

    window.addEventListener("resize", handleResize);

    // Show chart container
    elements.chartContainer.classList.remove("hidden");
  } catch (error) {
    console.error("Error rendering chart:", error);
    showMessage("Error displaying chart. Please try again.", "error");
  }
}

function destroyExistingChart(): void {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
}

// =========================================================================
// UI STATE MANAGEMENT & DISPLAY
// =========================================================================

function showMessage(message: string, type: MessageType): void {
  if (!elements.messageContainer) return;

  elements.messageContainer.innerHTML = `<p class="message-text">${message}</p>`;
  elements.messageContainer.className = `message-container ${type}`;
  elements.messageContainer.classList.remove("hidden");
}

function displayResults(result: CalculationResult, type: string): void {
  if (!elements.resultsContainer) return;

  let resultValue: string;
  let unit: string;

  // Format result based on calculation type
  if (type.includes("cagr")) {
    resultValue = formatAsPercentage(result.value / 100);
    unit = "CAGR";
  } else if (type.includes("multiplier")) {
    resultValue = formatAsMultiplier(result.value);
    unit = "Multiplier";
  } else {
    resultValue = formatAsYears(result.value);
    unit = "Time Period";
  }

  const resultHTML = `
        <div class="result-item">
            <span class="result-label">Calculated ${unit}:</span>
            <span class="result-value">${resultValue}</span>
        </div>
        <div class="result-formula">
            <strong>Formula:</strong> ${result.formula}
        </div>
        <div class="result-explanation">
            ${result.explanation}
        </div>
        ${
          !isRealisticValue(result.value, type.split("-")[0] as InputType)
            ? '<div class="result-warning">⚠️ This result may be outside typical investment scenarios.</div>'
            : ""
        }
    `;

  elements.resultsContainer.innerHTML = resultHTML;
  elements.resultsContainer.classList.remove("hidden");
}

function displayVerification(
  verification: VerificationResult,
  providedCAGR: number
): void {
  if (!elements.resultsContainer) return;

  const icon = verification.isCorrect ? "✅" : "❌";
  const status = verification.isCorrect ? "correct" : "incorrect";
  const message = verification.isCorrect
    ? "The provided CAGR is mathematically correct!"
    : `The provided CAGR does not match. Expected: ${formatAsPercentage(verification.expected / 100)}`;

  const verificationHTML = `
        <div class="verification-result ${status}">
            <h3>${icon} CAGR Verification</h3>
            <p class="verification-message">${message}</p>
            <div class="verification-details">
                <div class="detail-row">
                    <span>Provided CAGR:</span>
                    <span>${formatAsPercentage(providedCAGR / 100)}</span>
                </div>
                <div class="detail-row">
                    <span>Expected CAGR:</span>
                    <span>${formatAsPercentage(verification.expected / 100)}</span>
                </div>
                <div class="detail-row">
                    <span>Difference:</span>
                    <span>${formatAsPercentage(verification.difference / 100)}</span>
                </div>
            </div>
        </div>
    `;

  elements.resultsContainer.innerHTML = verificationHTML;
  elements.resultsContainer.classList.remove("hidden");
}

function updateResultsContainer(content: string): void {
  if (elements.resultsContainer) {
    elements.resultsContainer.innerHTML = content;
    elements.resultsContainer.classList.remove("hidden");
  }
}

function showTooltip(element: Element, text: string): void {
  if (!elements.tooltip) return;

  const rect = element.getBoundingClientRect();
  const tooltip = elements.tooltip;

  tooltip.querySelector(".tooltip-content")!.textContent = text;
  tooltip.style.left = rect.left + rect.width / 2 + "px";
  tooltip.style.top = rect.top - 10 + "px";
  tooltip.classList.remove("hidden");
}

function hideTooltip(): void {
  if (elements.tooltip) {
    elements.tooltip.classList.add("hidden");
  }
}

// =========================================================================
// MAIN CONTROLLER & INTEGRATION
// =========================================================================

function determineCalculationType(): CalculationType {
  const values = getFormValues();
  let count = 0;

  if (values.cagr !== null) count++;
  if (values.multiplier !== null) count++;
  if (values.years !== null) count++;

  switch (count) {
    case 0:
      return "zero";
    case 1:
      return "one";
    case 2:
      return "two";
    case 3:
      return "three";
    default:
      return "zero";
  }
}

function handleCalculateClick(): void {
  try {
    executeCalculationLogic();
  } catch (error) {
    console.error("Calculation error:", error);
    showMessage(`Error: ${(error as Error).message}`, "error");
  }
}

function executeCalculationLogic(): void {
  // Clear previous results and errors
  clearResults();
  clearFieldErrors();

  // Get and validate inputs
  const values = getFormValues();
  const validation = validateInputs(
    values.cagr,
    values.multiplier,
    values.years
  );

  if (!validation.isValid) {
    validation.errors.forEach((error) => {
      showFieldError(error.field, error.message);
    });
    return;
  }

  // Determine calculation type and execute
  const calcType = determineCalculationType();

  switch (calcType) {
    case "zero":
      handleZeroInputs();
      break;
    case "one":
      handleOneInput(values);
      break;
    case "two":
      handleTwoInputs(values);
      break;
    case "three":
      handleThreeInputs(values);
      break;
  }
}

function handleZeroInputs(): void {
  showMessage(
    "Please provide at least one input or refer to the matrix below to explore variable relationships.",
    "info"
  );
}

function handleOneInput(inputs: FormValues): void {
  try {
    if (inputs.cagr !== null) {
      const data = generateGraphData(inputs.cagr, "cagr");
      renderInteractiveGraph(data, "cagr", inputs.cagr);
      showMessage(
        `Showing growth potential with ${formatAsPercentage(inputs.cagr / 100)} CAGR over different time periods.`,
        "info"
      );
    } else if (inputs.multiplier !== null) {
      const data = generateGraphData(inputs.multiplier, "multiplier");
      renderInteractiveGraph(data, "multiplier", inputs.multiplier);
      showMessage(
        `Showing CAGR required to achieve ${formatAsMultiplier(inputs.multiplier)} growth over different time periods.`,
        "info"
      );
    } else if (inputs.years !== null) {
      const data = generateGraphData(inputs.years, "years");
      renderInteractiveGraph(data, "years", inputs.years);
      showMessage(
        `Showing growth potential over ${formatAsYears(inputs.years)} with different CAGR rates.`,
        "info"
      );
    }
  } catch (error) {
    showMessage(`Error generating chart: ${(error as Error).message}`, "error");
  }
}

function handleTwoInputs(inputs: FormValues): void {
  try {
    let result: CalculationResult;

    if (inputs.cagr !== null && inputs.years !== null) {
      // Calculate multiplier
      result = calculateMissingValue(inputs.cagr, inputs.years, "cagr-years");
      displayResults(result, "multiplier-calculation");
    } else if (inputs.multiplier !== null && inputs.years !== null) {
      // Calculate CAGR
      result = calculateMissingValue(
        inputs.multiplier,
        inputs.years,
        "multiplier-years"
      );
      displayResults(result, "cagr-calculation");
    } else if (inputs.cagr !== null && inputs.multiplier !== null) {
      // Calculate years
      result = calculateMissingValue(
        inputs.cagr,
        inputs.multiplier,
        "cagr-multiplier"
      );
      displayResults(result, "years-calculation");
    }
  } catch (error) {
    showMessage(`Calculation error: ${(error as Error).message}`, "error");
  }
}

function handleThreeInputs(inputs: FormValues): void {
  if (
    inputs.cagr === null ||
    inputs.multiplier === null ||
    inputs.years === null
  ) {
    return;
  }

  try {
    const verification = verifyCAGRCorrectness(
      inputs.cagr,
      inputs.multiplier,
      inputs.years
    );
    displayVerification(verification, inputs.cagr);

    const messageType = verification.isCorrect ? "success" : "warning";
    const message = verification.isCorrect
      ? "All inputs are mathematically consistent!"
      : "The provided values are not mathematically consistent. Check the verification details above.";

    showMessage(message, messageType);
  } catch (error) {
    showMessage(`Verification error: ${(error as Error).message}`, "error");
  }
}

function setupEventListeners(): void {
  // Calculate button click
  if (elements.calculateBtn) {
    elements.calculateBtn.addEventListener("click", handleCalculateClick);
  }

  // Enter key on form inputs
  if (elements.form) {
    elements.form.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCalculateClick();
      }
    });
  }

  // Tooltip events
  const infoIcons = document.querySelectorAll(".info-icon");
  infoIcons.forEach((icon) => {
    icon.addEventListener("mouseenter", (e) => {
      const target = e.target as HTMLElement;
      const tooltipText = target.getAttribute("data-tooltip");
      if (tooltipText) {
        showTooltip(target, tooltipText);
      }
    });

    icon.addEventListener("mouseleave", hideTooltip);
  });

  // Window resize for chart responsiveness
  const handleResize = debounce(() => {
    if (chartInstance) {
      chartInstance.resize();
    }
  }, 250);

  window.addEventListener("resize", handleResize);
}

function initializeElements(): void {
  elements.form = document.getElementById("cagr-form") as HTMLFormElement;
  elements.cagrInput = document.getElementById(
    "cagr-input"
  ) as HTMLInputElement;
  elements.multiplierInput = document.getElementById(
    "multiplier-input"
  ) as HTMLInputElement;
  elements.yearsInput = document.getElementById(
    "years-input"
  ) as HTMLInputElement;
  elements.calculateBtn = document.getElementById(
    "calculate-btn"
  ) as HTMLButtonElement;
  elements.resultsContainer = document.getElementById(
    "results-container"
  ) as HTMLElement;
  elements.chartContainer = document.getElementById(
    "chart-container"
  ) as HTMLElement;
  elements.messageContainer = document.getElementById(
    "message-container"
  ) as HTMLElement;
  elements.tooltip = document.getElementById("tooltip") as HTMLElement;
}

function main(): void {
  try {
    // Initialize DOM elements
    initializeElements();

    // Set up event listeners
    setupEventListeners();

    // Show initial message
    showMessage(
      "Please provide at least one input or refer to the matrix below to explore variable relationships.",
      "info"
    );

    console.log("CAGR Calculator initialized successfully");
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

// =========================================================================
// AUTO-INITIALIZATION
// =========================================================================

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
