const stages = [
  {
    label: "01 / THE CONTEXT PROBLEM",
    title: "The demo worked. The data changed.",
    context:
      "A fictional operations team wants an assistant over its internal knowledge base. On a fresh set of questions, it confidently cites an outdated policy. The sponsor asks for a better model before Friday.",
    choices: [
      {
        title: "Swap in a larger model and rerun the demo.",
        insight: "A model change is a hypothesis, not a diagnosis.",
        detail:
          "A more capable model may help reasoning, but it cannot make a stale source current. First separate retrieval failures from answer-generation failures, then compare models against the same representative questions.",
        takeaway: "Diagnose the failure before changing the model.",
      },
      {
        title:
          "Trace the source, check freshness, and build a small trusted question set.",
        insight: "Make the failure observable.",
        detail:
          "Inspect which document was retrieved, whether a current version exists, and how citations were selected. A small, stakeholder-validated question set gives the team a repeatable way to judge the fix.",
        takeaway: "Use traceable evidence and a trusted evaluation set.",
      },
      {
        title: "Tell the assistant to be more careful in its system prompt.",
        insight: "Instructions help, but the source still matters.",
        detail:
          "Abstention guidance is useful when evidence is weak. It does not replace source freshness, retrieval checks, and clear rules for conflicting documents. Use the prompt as one layer of a verifiable system.",
        takeaway: "Pair behavioral guardrails with reliable context.",
      },
    ],
  },
  {
    label: "02 / THE ACTION BOUNDARY",
    title: "“Can it just update the records?”",
    context:
      "The team now wants the assistant to write changes into its operational system. A sandbox is available, but record-level permissions and audit requirements are not yet mapped.",
    choices: [
      {
        title: "Connect broad write access to prove the full workflow quickly.",
        insight: "A broad tool makes the demo easy—and the boundary unclear.",
        detail:
          "Before allowing writes, map who may change which records and which actions need review. Start with scoped sandbox tools, observable tool calls, and a way to recover from incorrect changes.",
        takeaway: "Prove the workflow inside explicit permission boundaries.",
      },
      {
        title: "Keep it read-only forever; writes are too risky.",
        insight: "Control risk without ruling out the outcome.",
        detail:
          "Read-only access is a useful first stage. A staged path can add draft proposals, human approval, and narrowly scoped writes once the operational requirements and failure handling are understood.",
        takeaway: "Design a staged route from insight to action.",
      },
      {
        title:
          "Prototype proposed changes in the sandbox, with explicit human approval.",
        insight: "Make the action reviewable before making it real.",
        detail:
          "Validate the workflow with least-privilege tools. Show exactly what will change, record who approved it, and define idempotency and recovery behavior before expanding access.",
        takeaway:
          "Build review, least privilege, and recovery into the action path.",
      },
    ],
  },
  {
    label: "03 / THE RELEASE DECISION",
    title: "The launch date is tomorrow.",
    context:
      "The end-to-end flow is promising, but a critical permission edge case is unresolved. The sponsor still wants users to see progress. There is no named person responsible for accepting the workflow.",
    choices: [
      {
        title: "Launch broadly and monitor closely.",
        insight:
          "Monitoring tells you what happened; it does not establish readiness.",
        detail:
          "An unresolved access boundary can affect people before an alert arrives. Separate a controlled demonstration from a production rollout, and make the remaining acceptance conditions explicit.",
        takeaway:
          "Observability supports readiness; it does not substitute for it.",
      },
      {
        title:
          "Offer a bounded preview and agree the owner, evidence, and release gate.",
        insight: "Preserve momentum with an honest boundary.",
        detail:
          "Show the validated path using approved data and limited access. Name the acceptance owner, document the unresolved case, and agree what evidence is required before broader release.",
        takeaway: "Make progress visible and readiness evidence-based.",
      },
      {
        title: "Cancel the launch without proposing a next step.",
        insight: "A stop should come with a route forward.",
        detail:
          "A pause may be necessary, but it should explain the blocker, the owner, and the evidence needed to proceed. A safe preview can preserve learning while the critical issue is resolved.",
        takeaway: "Pair a clear stop condition with a concrete next step.",
      },
    ],
  },
];
export function mountScenario(container) {
  let stage = 0;
  const decisions = [];
  function draw() {
    const s = stages[stage];
    container.innerHTML = `<div class="dialog-eyebrow">YOU’RE THE FDE · FICTIONAL SCENARIO</div><h2 id="dialog-title" tabindex="-1">${s.title}</h2><div class="scenario-progress" role="img" aria-label="Decision ${stage + 1} of 3">${stages.map((_, i) => `<i class="${i <= stage ? "done" : ""}"></i>`).join("")}</div><span class="eyebrow">${s.label}</span><p>${s.context}</p><div class="scenario-choices">${s.choices.map((c, i) => `<button class="scenario-choice" data-choice="${i}">${c.title}</button>`).join("")}</div><div id="scenario-feedback" aria-live="polite"></div><p class="scenario-summary">A fictional deployment exercise. Explore the tradeoffs behind each decision.</p>`;
    container.querySelectorAll("[data-choice]").forEach((button) =>
      button.addEventListener("click", () => {
        const choice = s.choices[Number(button.dataset.choice)];
        decisions.push({ label: s.label, ...choice });
        container.querySelectorAll("[data-choice]").forEach((b) => {
          b.disabled = true;
          b.classList.toggle("chosen", b === button);
        });
        const feedback = container.querySelector("#scenario-feedback");
        feedback.className = "scenario-feedback";
        feedback.innerHTML = `<strong>${choice.insight}</strong><p>${choice.detail}</p><button class="button primary" id="scenario-next">${stage < 2 ? "Next decision" : "See your field notes"} <span>→</span></button>`;
        const next = feedback.querySelector("button");
        next.addEventListener("click", () => {
          stage++;
          if (stage < stages.length) draw();
          else finish();
          container.querySelector("h2").focus();
        });
        next.focus();
      }),
    );
  }
  function finish() {
    container.innerHTML = `<div class="dialog-eyebrow">THREE DECISIONS / ONE DEPLOYMENT</div><h2 id="dialog-title" tabindex="-1">Your field notes.</h2><p>Good engineering judgment makes the tradeoffs visible. Here are the principles behind the route you explored.</p>${decisions.map((d) => `<div class="scenario-recap"><span>${d.label}</span><p>${d.takeaway}</p></div>`).join("")}<p>The thread through all three: reliable context, controlled actions, and an honest definition of ready.</p><button class="game-button" id="scenario-restart">Explore another route</button><p class="scenario-summary">No score to chase. Just another route to explore.</p>`;
    container
      .querySelector("#scenario-restart")
      .addEventListener("click", () => {
        stage = 0;
        decisions.length = 0;
        draw();
        container.querySelector("h2").focus();
      });
  }
  draw();
}
