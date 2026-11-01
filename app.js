/**
 * GradeMaster - Academic Grade Calculator & Target Planner
 * Clean, reactive JavaScript logic for grade computations,
 * SVG gauge visualization, persistence, and grade scale customization.
 */

(function () {
  'use strict';

  // =========================================================================
  // Default Configurations & State
  // =========================================================================

  const DEFAULT_GRADE_SCALE = [
    { letter: 'A+', min: 97, gpa: 4.0 },
    { letter: 'A',  min: 93, gpa: 4.0 },
    { letter: 'A-', min: 90, gpa: 3.7 },
    { letter: 'B+', min: 87, gpa: 3.3 },
    { letter: 'B',  min: 83, gpa: 3.0 },
    { letter: 'B-', min: 80, gpa: 2.7 },
    { letter: 'C+', min: 77, gpa: 2.3 },
    { letter: 'C',  min: 73, gpa: 2.0 },
    { letter: 'C-', min: 70, gpa: 1.7 },
    { letter: 'D+', min: 67, gpa: 1.3 },
    { letter: 'D',  min: 60, gpa: 1.0 },
    { letter: 'F',  min: 0,  gpa: 0.0 }
  ];

  const PRESETS = {
    college: [
      { name: 'Homework & Assignments', score: 92, weight: 15, isPointsMode: false, earned: 0, possible: 100 },
      { name: 'Quizzes & Participation', score: 88, weight: 15, isPointsMode: false, earned: 0, possible: 100 },
      { name: 'Midterm Exam', score: 85, weight: 25, isPointsMode: false, earned: 0, possible: 100 },
      { name: 'Semester Project', score: 94, weight: 20, isPointsMode: false, earned: 0, possible: 100 },
      { name: 'Final Examination', score: 90, weight: 25, isPointsMode: false, earned: 0, possible: 100 }
    ],
    stem: [
      { name: 'Weekly Lab Experiments', score: 95, weight: 25, isPointsMode: false, earned: 0, possible: 100 },
      { name: 'Formal Lab Reports', score: 89, weight: 20, isPointsMode: false, earned: 0, possible: 100 },
      { name: 'Midterm Exam', score: 82, weight: 25, isPointsMode: false, earned: 0, possible: 100 },
      { name: 'Comprehensive Final Exam', score: 88, weight: 30, isPointsMode: false, earned: 0, possible: 100 }
    ],
    highschool: [
      { name: 'Unit Tests', score: 86, weight: 40, isPointsMode: false, earned: 0, possible: 100 },
      { name: 'Weekly Quizzes', score: 92, weight: 25, isPointsMode: false, earned: 0, possible: 100 },
      { name: 'Homework & Classwork', score: 98, weight: 20, isPointsMode: false, earned: 0, possible: 100 },
      { name: 'Participation & Attendance', score: 100, weight: 15, isPointsMode: false, earned: 0, possible: 100 }
    ]
  };

  const DEFAULT_POINTS_DATA = [
    { name: 'Exam 1', earned: 88, possible: 100 },
    { name: 'Midterm Essay', earned: 45, possible: 50 },
    { name: 'Lab 1-4 Average', earned: 142, possible: 150 },
    { name: 'Quiz Set', earned: 92, possible: 100 }
  ];

  const DEFAULT_GPA_DATA = [
    { name: 'Calculus II', credits: 4, grade: 'A-' },
    { name: 'Data Structures & Algorithms', credits: 4, grade: 'A' },
    { name: 'Physics Mechanics', credits: 3, grade: 'B+' },
    { name: 'Academic Writing & Rhetoric', credits: 3, grade: 'A' }
  ];

  // State object
  let state = {
    activeTab: 'weighted',
    gradeScale: JSON.parse(JSON.stringify(DEFAULT_GRADE_SCALE)),
    weightedRows: JSON.parse(JSON.stringify(PRESETS.college)),
    pointsRows: JSON.parse(JSON.stringify(DEFAULT_POINTS_DATA)),
    gpaRows: JSON.parse(JSON.stringify(DEFAULT_GPA_DATA)),
    finalExam: {
      currentGrade: 84.5,
      finalWeight: 25,
      targetGrade: 90
    }
  };

  const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 82; // ~515.221

  // =========================================================================
  // DOM Elements Selection
  // =========================================================================

  const DOM = {
    themeToggle: document.getElementById('theme-toggle'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),

    // Presets
    btnPresets: document.getElementById('btn-presets'),
    presetsMenu: document.getElementById('presets-menu'),

    // Scale modal
    btnOpenScale: document.getElementById('btn-open-scale'),
    scaleModal: document.getElementById('scale-modal'),
    btnCloseScale: document.getElementById('btn-close-scale'),
    btnResetScale: document.getElementById('btn-reset-scale'),
    btnSaveScale: document.getElementById('btn-save-scale'),
    scaleGrid: document.getElementById('scale-grid'),

    // Print
    btnPrint: document.getElementById('btn-print'),

    // Weighted tab elements
    weightedTbody: document.getElementById('weighted-tbody'),
    btnAddWeightedRow: document.getElementById('btn-add-weighted-row'),
    totalWeightDisplay: document.getElementById('total-weight-display'),
    weightProgressFill: document.getElementById('weight-progress-fill'),
    weightHint: document.getElementById('weight-hint'),

    // Final exam tab elements
    feCurrentGrade: document.getElementById('fe-current-grade'),
    feFinalWeight: document.getElementById('fe-final-weight'),
    feTargetGrade: document.getElementById('fe-target-grade'),
    feTargetPreset: document.getElementById('fe-target-preset'),
    feResultHeadline: document.getElementById('fe-result-headline'),
    feResultSub: document.getElementById('fe-result-sub'),
    feRequiredScore: document.getElementById('fe-required-score'),
    feResultIcon: document.getElementById('fe-result-icon'),

    // Points tab elements
    pointsTbody: document.getElementById('points-tbody'),
    btnAddPointsRow: document.getElementById('btn-add-points-row'),
    pointsEarnedSum: document.getElementById('points-earned-sum'),
    pointsTotalSum: document.getElementById('points-total-sum'),
    pointsRatioDisplay: document.getElementById('points-ratio-display'),

    // GPA tab elements
    gpaTbody: document.getElementById('gpa-tbody'),
    btnAddGpaRow: document.getElementById('btn-add-gpa-row'),
    gpaTotalCredits: document.getElementById('gpa-total-credits'),
    gpaTotalPoints: document.getElementById('gpa-total-points'),
    gpaFinalVal: document.getElementById('gpa-final-val'),

    // Summary Card elements
    summaryTitle: document.getElementById('summary-card-title'),
    summaryStatusPill: document.getElementById('summary-status-pill'),
    gaugeCircle: document.getElementById('gauge-circle'),
    gaugePercent: document.getElementById('gauge-percent'),
    gaugeLetter: document.getElementById('gauge-letter'),
    metricLetter: document.getElementById('metric-letter'),
    metricGpa: document.getElementById('metric-gpa'),
    metricStanding: document.getElementById('metric-standing'),
    breakdownContainer: document.getElementById('breakdown-container'),
    breakdownItems: document.getElementById('breakdown-items'),
    tipText: document.getElementById('tip-text'),

    toastContainer: document.getElementById('toast-container')
  };

  // =========================================================================
  // Math & Calculation Utilities
  // =========================================================================

  /**
   * Determine letter grade and 4.0 GPA equivalent based on current grading scale
   */
  function getGradeInfo(percentage) {
    if (isNaN(percentage) || percentage === null) {
      return { letter: '--', gpa: '0.00', color: 'var(--text-muted)', standing: 'N/A' };
    }

    const sortedScale = [...state.gradeScale].sort((a, b) => b.min - a.min);
    for (const tier of sortedScale) {
      if (percentage >= tier.min) {
        let color = 'var(--primary)';
        let standing = 'Good Standing';

        if (tier.min >= 90) {
          color = 'var(--success)';
          standing = 'Outstanding';
        } else if (tier.min >= 80) {
          color = 'var(--info)';
          standing = 'Above Average';
        } else if (tier.min >= 70) {
          color = 'var(--warning)';
          standing = 'Satisfactory';
        } else if (tier.min >= 60) {
          color = 'var(--warning)';
          standing = 'Passing / Warning';
        } else {
          color = 'var(--danger)';
          standing = 'Needs Improvement';
        }

        return {
          letter: tier.letter,
          gpa: tier.gpa.toFixed(2),
          color,
          standing
        };
      }
    }

    const lowest = sortedScale[sortedScale.length - 1] || { letter: 'F', gpa: 0.0 };
    return {
      letter: lowest.letter,
      gpa: lowest.gpa.toFixed(2),
      color: 'var(--danger)',
      standing: 'Needs Improvement'
    };
  }

  /**
   * Calculate overall score for Weighted Mode
   */
  function calculateWeighted() {
    let totalWeight = 0;
    let earnedWeight = 0;
    const contributions = [];

    state.weightedRows.forEach(row => {
      let score = Number(row.score);
      const weight = Number(row.weight) || 0;

      if (row.isPointsMode) {
        const earned = Number(row.earned) || 0;
        const possible = Number(row.possible) || 0;
        score = possible > 0 ? (earned / possible) * 100 : 0;
      }

      if (isNaN(score)) score = 0;

      totalWeight += weight;
      const contribution = (score * weight) / 100;
      earnedWeight += contribution;

      contributions.push({
        name: row.name || 'Untitled Item',
        score: score,
        weight: weight,
        contribution: contribution
      });
    });

    // If total weight is greater than 0, normalize score based on weight evaluated
    let overallPercentage = 0;
    if (totalWeight > 0) {
      overallPercentage = (earnedWeight / totalWeight) * 100;
    }

    return {
      totalWeight,
      earnedWeight,
      overallPercentage,
      contributions
    };
  }

  /**
   * Calculate Points Mode
   */
  function calculatePoints() {
    let totalEarned = 0;
    let totalPossible = 0;

    state.pointsRows.forEach(row => {
      const e = Number(row.earned) || 0;
      const p = Number(row.possible) || 0;
      totalEarned += e;
      totalPossible += p;
    });

    const percentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    return {
      totalEarned,
      totalPossible,
      percentage
    };
  }

  /**
   * Calculate Final Exam Target
   */
  function calculateFinalExamTarget() {
    const current = Number(state.finalExam.currentGrade) || 0;
    const weight = Number(state.finalExam.finalWeight) || 0;
    const target = Number(state.finalExam.targetGrade) || 0;

    if (weight <= 0) {
      return { required: 0, status: 'invalid', message: 'Final weight must be greater than 0%' };
    }

    // Formula: Target = Current * (1 - Weight/100) + Exam * (Weight/100)
    // Exam = (Target - Current * (1 - Weight/100)) / (Weight/100)
    const weightDecimal = weight / 100;
    const priorProportion = 1 - weightDecimal;
    const required = (target - (current * priorProportion)) / weightDecimal;

    let icon = '🎯';
    let headline = '';
    let sub = '';

    if (required <= 0) {
      icon = '🎉';
      headline = 'Grade Already Secured!';
      sub = `Even with 0% on the final exam, your final score will be ${(current * priorProportion).toFixed(1)}%, achieving your goal.`;
    } else if (required <= 60) {
      icon = '✅';
      headline = 'Comfortably Achievable';
      sub = `You only need a basic passing score of ${required.toFixed(1)}% to lock in your grade.`;
    } else if (required <= 85) {
      icon = '📘';
      headline = 'Well Within Reach';
      sub = `A solid study session should easily put you over the ${required.toFixed(1)}% requirement.`;
    } else if (required <= 100) {
      icon = '🔥';
      headline = 'Challenging, Study Up!';
      sub = `You need ${required.toFixed(1)}% on this exam. Focus on high-yield syllabus topics.`;
    } else {
      icon = '⚠️';
      headline = 'Extra Credit Needed';
      sub = `Mathematical requirement exceeds 100% (${required.toFixed(1)}%). Inquire with instructor for bonus credit.`;
    }

    return {
      required: Number(required.toFixed(1)),
      icon,
      headline,
      sub
    };
  }

  /**
   * Calculate Semester GPA
   */
  function calculateGPA() {
    let totalCredits = 0;
    let totalQualityPoints = 0;

    state.gpaRows.forEach(row => {
      const credits = Number(row.credits) || 0;
      const gradeStr = row.grade;
      const tier = state.gradeScale.find(t => t.letter === gradeStr) || { gpa: 0.0 };

      totalCredits += credits;
      totalQualityPoints += credits * tier.gpa;
    });

    const gpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
    return {
      totalCredits,
      totalQualityPoints,
      gpa: Number(gpa.toFixed(2))
    };
  }

  // =========================================================================
  // Rendering & UI Synchronization
  // =========================================================================

  /**
   * Update the Circular Gauge and right-hand Summary Card
   */
  function updateSummary(percentage, options = {}) {
    const isGPA = state.activeTab === 'gpa';

    if (isGPA) {
      const gpaData = calculateGPA();
      DOM.summaryTitle.textContent = 'Semester GPA Standing';
      DOM.summaryStatusPill.textContent = `${gpaData.totalCredits} Credits`;

      // Visual percentage equivalent on 4.0 scale
      const gpaPercent = (gpaData.gpa / 4.0) * 100;
      DOM.gaugePercent.textContent = gpaData.gpa.toFixed(2);
      DOM.gaugeLetter.textContent = 'GPA';

      const offset = GAUGE_CIRCUMFERENCE * (1 - Math.min(Math.max(gpaPercent, 0), 100) / 100);
      DOM.gaugeCircle.style.strokeDashoffset = offset;
      DOM.gaugeCircle.style.stroke = gpaData.gpa >= 3.5 ? 'var(--success)' : gpaData.gpa >= 3.0 ? 'var(--info)' : gpaData.gpa >= 2.0 ? 'var(--warning)' : 'var(--danger)';

      DOM.metricLetter.textContent = `${gpaData.gpa.toFixed(2)} / 4.0`;
      DOM.metricGpa.textContent = `${gpaData.totalQualityPoints.toFixed(1)} QP`;
      DOM.metricStanding.textContent = gpaData.gpa >= 3.5 ? 'Dean\'s List' : gpaData.gpa >= 3.0 ? 'Good Standing' : 'Academic Focus';

      DOM.breakdownContainer.style.display = 'none';
      DOM.tipText.textContent = 'Pro tip: High-credit courses (4-5 credits) exert the highest leverage on your cumulative GPA.';
      return;
    }

    DOM.breakdownContainer.style.display = 'block';

    const safePercentage = Math.min(Math.max(percentage, 0), 200);
    const gradeInfo = getGradeInfo(percentage);

    DOM.summaryTitle.textContent = options.title || 'Current Standing';
    DOM.summaryStatusPill.textContent = options.pill || 'Active';

    DOM.gaugePercent.textContent = `${percentage.toFixed(1)}%`;
    DOM.gaugeLetter.textContent = gradeInfo.letter;
    DOM.gaugeLetter.style.background = gradeInfo.color + '22';
    DOM.gaugeLetter.style.color = gradeInfo.color;

    // Gauge circle animation (cap visual display at 100% for ring fill)
    const ringPercent = Math.min(safePercentage, 100);
    const offset = GAUGE_CIRCUMFERENCE * (1 - ringPercent / 100);
    DOM.gaugeCircle.style.strokeDashoffset = offset;
    DOM.gaugeCircle.style.stroke = gradeInfo.color;

    DOM.metricLetter.textContent = gradeInfo.letter;
    DOM.metricGpa.textContent = gradeInfo.gpa;
    DOM.metricStanding.textContent = gradeInfo.standing;

    // Render contributions if in weighted mode
    if (state.activeTab === 'weighted') {
      const { contributions } = calculateWeighted();
      DOM.breakdownItems.innerHTML = '';
      if (contributions.length === 0) {
        DOM.breakdownItems.innerHTML = '<div class="breakdown-item text-muted">No assignments listed</div>';
      } else {
        contributions.forEach(c => {
          const item = document.createElement('div');
          item.className = 'breakdown-item';
          item.innerHTML = `
            <span class="breakdown-name" title="${escapeHtml(c.name)}">${escapeHtml(c.name)}</span>
            <span class="breakdown-pts">+${c.contribution.toFixed(1)}% (${c.weight}%)</span>
          `;
          DOM.breakdownItems.appendChild(item);
        });
      }
      DOM.tipText.textContent = 'Keep weights totaling 100% to ensure your syllabus calculation reflects true final course standing.';
    } else if (state.activeTab === 'points') {
      const p = calculatePoints();
      DOM.breakdownItems.innerHTML = `
        <div class="breakdown-item">
          <span class="breakdown-name">Earned Total</span>
          <span class="breakdown-pts">${p.totalEarned} pts</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-name">Possible Total</span>
          <span class="breakdown-pts">${p.totalPossible} pts</span>
        </div>
      `;
      DOM.tipText.textContent = 'Every point matters equally in points-based courses! Focus on assignment completion and exam bonuses.';
    } else if (state.activeTab === 'final-exam') {
      DOM.breakdownContainer.style.display = 'none';
      DOM.tipText.textContent = 'Check your syllabus for final exam curve policies or grade floor guarantees before exam week.';
    }
  }

  /**
   * Render Weighted Rows Table
   */
  function renderWeightedTable() {
    DOM.weightedTbody.innerHTML = '';

    state.weightedRows.forEach((row, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <input type="text" class="form-input row-name" value="${escapeHtml(row.name)}" placeholder="e.g. Midterm 1" data-index="${index}">
        </td>
        <td>
          ${row.isPointsMode ? `
            <div class="points-fraction-box">
              <input type="number" class="form-input row-earned" value="${row.earned ?? 0}" step="0.5" placeholder="Earned" data-index="${index}">
              <span class="fraction-slash">/</span>
              <input type="number" class="form-input row-possible" value="${row.possible ?? 100}" step="0.5" placeholder="Total" data-index="${index}">
            </div>
          ` : `
            <div class="input-with-symbol">
              <input type="number" class="form-input row-score" value="${row.score ?? 0}" min="0" max="200" step="0.1" placeholder="Score" data-index="${index}">
              <span class="input-symbol">%</span>
            </div>
          `}
        </td>
        <td>
          <div class="input-with-symbol">
            <input type="number" class="form-input row-weight" value="${row.weight ?? 0}" min="0" max="100" step="0.5" placeholder="Weight" data-index="${index}">
            <span class="input-symbol">%</span>
          </div>
        </td>
        <td>
          <label class="points-mode-toggle" title="Toggle between entering direct % or Earned / Possible points">
            <input type="checkbox" class="toggle-pts-mode" ${row.isPointsMode ? 'checked' : ''} data-index="${index}">
            <span>Points</span>
          </label>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-delete btn-delete-weighted" data-index="${index}" title="Delete row" aria-label="Delete assignment">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </td>
      `;
      DOM.weightedTbody.appendChild(tr);
    });

    updateWeightedCalculations();
  }

  /**
   * Update Weighted Calculations & Progress bar
   */
  function updateWeightedCalculations() {
    const { totalWeight, overallPercentage } = calculateWeighted();

    DOM.totalWeightDisplay.textContent = `${totalWeight.toFixed(1)}%`;
    DOM.weightProgressFill.style.width = `${Math.min(totalWeight, 100)}%`;

    if (Math.abs(totalWeight - 100) < 0.05) {
      DOM.weightProgressFill.className = 'progress-fill';
      DOM.weightHint.textContent = 'Weights sum to exactly 100%. Grade calculation is complete.';
      DOM.weightHint.style.color = 'var(--success)';
    } else if (totalWeight < 100) {
      DOM.weightProgressFill.className = 'progress-fill under';
      DOM.weightHint.textContent = `Weights sum to ${totalWeight.toFixed(1)}% (${(100 - totalWeight).toFixed(1)}% unallocated). Current score is normalized based on evaluated work.`;
      DOM.weightHint.style.color = 'var(--warning)';
    } else {
      DOM.weightProgressFill.className = 'progress-fill over';
      DOM.weightHint.textContent = `Weights exceed 100% by ${(totalWeight - 100).toFixed(1)}%! Please adjust categories.`;
      DOM.weightHint.style.color = 'var(--danger)';
    }

    if (state.activeTab === 'weighted') {
      updateSummary(overallPercentage, { title: 'Weighted Course Grade', pill: `${totalWeight.toFixed(0)}% Weight` });
    }
  }

  /**
   * Render Points Table
   */
  function renderPointsTable() {
    DOM.pointsTbody.innerHTML = '';

    state.pointsRows.forEach((row, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <input type="text" class="form-input pts-name" value="${escapeHtml(row.name)}" placeholder="e.g. Homework 1" data-index="${index}">
        </td>
        <td>
          <input type="number" class="form-input pts-earned" value="${row.earned ?? 0}" step="0.5" placeholder="Earned" data-index="${index}">
        </td>
        <td>
          <input type="number" class="form-input pts-possible" value="${row.possible ?? 100}" step="0.5" placeholder="Possible" data-index="${index}">
        </td>
        <td style="text-align: right;">
          <button class="btn btn-delete btn-delete-points" data-index="${index}" title="Delete row" aria-label="Delete assignment">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </td>
      `;
      DOM.pointsTbody.appendChild(tr);
    });

    updatePointsCalculations();
  }

  /**
   * Update Points Calculations
   */
  function updatePointsCalculations() {
    const { totalEarned, totalPossible, percentage } = calculatePoints();

    DOM.pointsEarnedSum.textContent = totalEarned.toFixed(1);
    DOM.pointsTotalSum.textContent = totalPossible.toFixed(1);
    DOM.pointsRatioDisplay.textContent = `${percentage.toFixed(1)}%`;

    if (state.activeTab === 'points') {
      updateSummary(percentage, { title: 'Points Grade Standing', pill: `${totalEarned}/${totalPossible} Pts` });
    }
  }

  /**
   * Render GPA Table
   */
  function renderGpaTable() {
    DOM.gpaTbody.innerHTML = '';

    const gradeOptions = state.gradeScale.map(tier => {
      return `<option value="${tier.letter}">${tier.letter} (${tier.gpa.toFixed(1)})</option>`;
    }).join('');

    state.gpaRows.forEach((row, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <input type="text" class="form-input gpa-name" value="${escapeHtml(row.name)}" placeholder="Course name" data-index="${index}">
        </td>
        <td>
          <input type="number" class="form-input gpa-credits" value="${row.credits ?? 3}" min="0.5" max="20" step="0.5" placeholder="Credits" data-index="${index}">
        </td>
        <td>
          <select class="form-select gpa-grade" data-index="${index}">
            ${gradeOptions}
          </select>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-delete btn-delete-gpa" data-index="${index}" title="Delete row" aria-label="Delete course">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </td>
      `;
      // Set dropdown selected value
      const select = tr.querySelector('.gpa-grade');
      if (select) select.value = row.grade || 'A';

      DOM.gpaTbody.appendChild(tr);
    });

    updateGpaCalculations();
  }

  /**
   * Update GPA Calculations
   */
  function updateGpaCalculations() {
    const { totalCredits, totalQualityPoints, gpa } = calculateGPA();

    DOM.gpaTotalCredits.textContent = totalCredits.toFixed(1);
    DOM.gpaTotalPoints.textContent = totalQualityPoints.toFixed(1);
    DOM.gpaFinalVal.textContent = gpa.toFixed(2);

    if (state.activeTab === 'gpa') {
      updateSummary(0);
    }
  }

  /**
   * Update Final Exam Target Calculations
   */
  function updateFinalExamCalculations() {
    state.finalExam.currentGrade = parseFloat(DOM.feCurrentGrade.value) || 0;
    state.finalExam.finalWeight = parseFloat(DOM.feFinalWeight.value) || 0;
    state.finalExam.targetGrade = parseFloat(DOM.feTargetGrade.value) || 0;

    const res = calculateFinalExamTarget();

    DOM.feResultIcon.textContent = res.icon;
    DOM.feResultHeadline.textContent = res.headline;
    DOM.feResultSub.textContent = res.sub;
    DOM.feRequiredScore.textContent = `${res.required}%`;

    if (state.activeTab === 'final-exam') {
      updateSummary(state.finalExam.targetGrade, {
        title: 'Target Final Grade',
        pill: `Need ${res.required}%`
      });
    }
  }

  /**
   * Render custom grade scale in modal
   */
  function renderGradeScaleModal() {
    DOM.scaleGrid.innerHTML = '';
    state.gradeScale.forEach((tier, index) => {
      const row = document.createElement('div');
      row.className = 'scale-row';
      row.innerHTML = `
        <span class="scale-badge">${tier.letter}</span>
        <div class="input-with-symbol" style="flex: 1;">
          <input type="number" class="form-input scale-min-input" value="${tier.min}" min="0" max="100" step="1" data-index="${index}">
          <span class="input-symbol">% min</span>
        </div>
      `;
      DOM.scaleGrid.appendChild(row);
    });
  }

  // =========================================================================
  // Persistence & Storage
  // =========================================================================

  const STORAGE_KEY = 'grademaster_data_v1';

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.gradeScale) state.gradeScale = parsed.gradeScale;
        if (parsed.weightedRows) state.weightedRows = parsed.weightedRows;
        if (parsed.pointsRows) state.pointsRows = parsed.pointsRows;
        if (parsed.gpaRows) state.gpaRows = parsed.gpaRows;
        if (parsed.finalExam) state.finalExam = parsed.finalExam;
        if (parsed.activeTab) state.activeTab = parsed.activeTab;
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    DOM.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      })[m];
    });
  }

  // =========================================================================
  // Event Listeners & Interactions
  // =========================================================================

  function initEventListeners() {
    // 1. Theme toggle
    const savedTheme = localStorage.getItem('grademaster_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    DOM.themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('grademaster_theme', next);
      showToast(`Switched to ${next} mode`);
    });

    // 2. Tab switching
    DOM.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        setActiveTab(targetTab);
      });
    });

    // 3. Weighted tab row inputs delegation
    DOM.weightedTbody.addEventListener('input', (e) => {
      const target = e.target;
      const index = parseInt(target.getAttribute('data-index'), 10);
      if (isNaN(index) || !state.weightedRows[index]) return;

      if (target.classList.contains('row-name')) {
        state.weightedRows[index].name = target.value;
      } else if (target.classList.contains('row-score')) {
        state.weightedRows[index].score = parseFloat(target.value) || 0;
      } else if (target.classList.contains('row-weight')) {
        state.weightedRows[index].weight = parseFloat(target.value) || 0;
      } else if (target.classList.contains('row-earned')) {
        state.weightedRows[index].earned = parseFloat(target.value) || 0;
      } else if (target.classList.contains('row-possible')) {
        state.weightedRows[index].possible = parseFloat(target.value) || 0;
      }

      updateWeightedCalculations();
      saveToStorage();
    });

    DOM.weightedTbody.addEventListener('change', (e) => {
      const target = e.target;
      const index = parseInt(target.getAttribute('data-index'), 10);
      if (isNaN(index) || !state.weightedRows[index]) return;

      if (target.classList.contains('toggle-pts-mode')) {
        state.weightedRows[index].isPointsMode = target.checked;
        renderWeightedTable();
        saveToStorage();
      }
    });

    DOM.weightedTbody.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-delete-weighted');
      if (!btn) return;
      const index = parseInt(btn.getAttribute('data-index'), 10);
      if (!isNaN(index)) {
        state.weightedRows.splice(index, 1);
        renderWeightedTable();
        saveToStorage();
        showToast('Assignment row removed');
      }
    });

    DOM.btnAddWeightedRow.addEventListener('click', () => {
      state.weightedRows.push({
        name: `Assignment ${state.weightedRows.length + 1}`,
        score: 90,
        weight: 10,
        isPointsMode: false,
        earned: 0,
        possible: 100
      });
      renderWeightedTable();
      saveToStorage();
      showToast('New weighted row added');
    });

    // 4. Final Exam Target inputs
    [DOM.feCurrentGrade, DOM.feFinalWeight, DOM.feTargetGrade].forEach(input => {
      input.addEventListener('input', () => {
        updateFinalExamCalculations();
        saveToStorage();
      });
    });

    DOM.feTargetPreset.addEventListener('change', () => {
      if (DOM.feTargetPreset.value) {
        DOM.feTargetGrade.value = DOM.feTargetPreset.value;
        updateFinalExamCalculations();
        saveToStorage();
      }
    });

    // 5. Points tab inputs delegation
    DOM.pointsTbody.addEventListener('input', (e) => {
      const target = e.target;
      const index = parseInt(target.getAttribute('data-index'), 10);
      if (isNaN(index) || !state.pointsRows[index]) return;

      if (target.classList.contains('pts-name')) {
        state.pointsRows[index].name = target.value;
      } else if (target.classList.contains('pts-earned')) {
        state.pointsRows[index].earned = parseFloat(target.value) || 0;
      } else if (target.classList.contains('pts-possible')) {
        state.pointsRows[index].possible = parseFloat(target.value) || 0;
      }

      updatePointsCalculations();
      saveToStorage();
    });

    DOM.pointsTbody.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-delete-points');
      if (!btn) return;
      const index = parseInt(btn.getAttribute('data-index'), 10);
      if (!isNaN(index)) {
        state.pointsRows.splice(index, 1);
        renderPointsTable();
        saveToStorage();
        showToast('Assignment removed');
      }
    });

    DOM.btnAddPointsRow.addEventListener('click', () => {
      state.pointsRows.push({
        name: `Assignment ${state.pointsRows.length + 1}`,
        earned: 90,
        possible: 100
      });
      renderPointsTable();
      saveToStorage();
      showToast('New assignment added');
    });

    // 6. GPA tab inputs delegation
    DOM.gpaTbody.addEventListener('input', (e) => {
      const target = e.target;
      const index = parseInt(target.getAttribute('data-index'), 10);
      if (isNaN(index) || !state.gpaRows[index]) return;

      if (target.classList.contains('gpa-name')) {
        state.gpaRows[index].name = target.value;
      } else if (target.classList.contains('gpa-credits')) {
        state.gpaRows[index].credits = parseFloat(target.value) || 0;
      }

      updateGpaCalculations();
      saveToStorage();
    });

    DOM.gpaTbody.addEventListener('change', (e) => {
      const target = e.target;
      const index = parseInt(target.getAttribute('data-index'), 10);
      if (isNaN(index) || !state.gpaRows[index]) return;

      if (target.classList.contains('gpa-grade')) {
        state.gpaRows[index].grade = target.value;
        updateGpaCalculations();
        saveToStorage();
      }
    });

    DOM.gpaTbody.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-delete-gpa');
      if (!btn) return;
      const index = parseInt(btn.getAttribute('data-index'), 10);
      if (!isNaN(index)) {
        state.gpaRows.splice(index, 1);
        renderGpaTable();
        saveToStorage();
        showToast('Course removed');
      }
    });

    DOM.btnAddGpaRow.addEventListener('click', () => {
      state.gpaRows.push({
        name: `Elective Course ${state.gpaRows.length + 1}`,
        credits: 3,
        grade: 'A'
      });
      renderGpaTable();
      saveToStorage();
      showToast('New course added');
    });

    // 7. Presets dropdown
    DOM.btnPresets.addEventListener('click', (e) => {
      e.stopPropagation();
      DOM.presetsMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      DOM.presetsMenu.classList.remove('show');
    });

    DOM.presetsMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (!item) return;
      const presetKey = item.getAttribute('data-preset');

      if (presetKey === 'clear') {
        state.weightedRows = [];
        renderWeightedTable();
        showToast('Cleared all weighted rows');
      } else if (PRESETS[presetKey]) {
        state.weightedRows = JSON.parse(JSON.stringify(PRESETS[presetKey]));
        renderWeightedTable();
        showToast(`Loaded ${item.textContent.split('(')[0].trim()} preset`);
      }
      saveToStorage();
    });

    // 8. Custom grading scale modal
    DOM.btnOpenScale.addEventListener('click', () => {
      renderGradeScaleModal();
      DOM.scaleModal.classList.add('show');
    });

    DOM.btnCloseScale.addEventListener('click', () => {
      DOM.scaleModal.classList.remove('show');
    });

    DOM.scaleModal.addEventListener('click', (e) => {
      if (e.target === DOM.scaleModal) {
        DOM.scaleModal.classList.remove('show');
      }
    });

    DOM.btnResetScale.addEventListener('click', () => {
      state.gradeScale = JSON.parse(JSON.stringify(DEFAULT_GRADE_SCALE));
      renderGradeScaleModal();
      showToast('Scale reset to default');
    });

    DOM.btnSaveScale.addEventListener('click', () => {
      const inputs = DOM.scaleGrid.querySelectorAll('.scale-min-input');
      inputs.forEach(input => {
        const index = parseInt(input.getAttribute('data-index'), 10);
        if (!isNaN(index) && state.gradeScale[index]) {
          state.gradeScale[index].min = parseFloat(input.value) || 0;
        }
      });
      DOM.scaleModal.classList.remove('show');
      refreshActiveTab();
      saveToStorage();
      showToast('Custom grading scale saved');
    });

    // 9. Print / PDF Export
    DOM.btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  function setActiveTab(tabId) {
    state.activeTab = tabId;

    DOM.tabButtons.forEach(b => {
      const isSelected = b.getAttribute('data-tab') === tabId;
      b.classList.toggle('active', isSelected);
      b.setAttribute('aria-selected', isSelected);
    });

    DOM.tabPanes.forEach(p => {
      p.classList.toggle('active', p.id === `pane-${tabId}`);
    });

    refreshActiveTab();
    saveToStorage();
  }

  function refreshActiveTab() {
    if (state.activeTab === 'weighted') {
      updateWeightedCalculations();
    } else if (state.activeTab === 'final-exam') {
      updateFinalExamCalculations();
    } else if (state.activeTab === 'points') {
      updatePointsCalculations();
    } else if (state.activeTab === 'gpa') {
      updateGpaCalculations();
    }
  }

  // =========================================================================
  // Initialization
  // =========================================================================

  function init() {
    loadFromStorage();

    // Populate Initial Final Exam Form
    DOM.feCurrentGrade.value = state.finalExam.currentGrade;
    DOM.feFinalWeight.value = state.finalExam.finalWeight;
    DOM.feTargetGrade.value = state.finalExam.targetGrade;

    initEventListeners();

    renderWeightedTable();
    renderPointsTable();
    renderGpaTable();

    setActiveTab(state.activeTab || 'weighted');
  }

  // Expose test helper if running in automated test environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      calculateWeighted,
      calculatePoints,
      calculateFinalExamTarget,
      calculateGPA,
      getGradeInfo,
      DEFAULT_GRADE_SCALE
    };
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

})();
