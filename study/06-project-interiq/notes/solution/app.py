# app.py -- INSTRUCTOR REFERENCE (fully implemented)
# ============================================================
#  InterviewIQ -- Gradio interface
#  A browser UI over the same agent used by main.py: step
#  through interview_bank.py's questions, see feedback per
#  answer, watch the scorecard build up, ask the coach meta-
#  questions ("how am I doing?"), and pull a final report --
#  all backed by agent.py's session memory.
#  Run:  python app.py
# ============================================================

import gradio as gr
from interview_bank import QUESTIONS
import agent


def format_scorecard():
    if not agent.session_log:
        return "_No answers scored yet._"
    lines = []
    for i, entry in enumerate(agent.session_log, 1):
        r = entry["results"]
        rel = r.get("score_relevance", {}).get("score", "-")
        fillers = r.get("detect_filler_words", {}).get("total", "-")
        lines.append(f"**Q{i}.** {entry['question']}  \nRelevance: {rel}/100 | Fillers: {fillers}")
    return "\n\n".join(lines)


def on_submit(answer, q_index):
    if q_index >= len(QUESTIONS):
        return "No more questions -- click 'Get Final Report'.", format_scorecard(), q_index, "**-- interview complete --**", ""

    q = QUESTIONS[q_index]
    feedback = agent.run_turn(q["question"], answer, q["expected_keywords"])
    next_index = q_index + 1
    if next_index < len(QUESTIONS):
        next_display = f"**Q{next_index + 1}.** {QUESTIONS[next_index]['question']}"
    else:
        next_display = "**-- interview complete -- click 'Get Final Report' --**"
    return feedback, format_scorecard(), next_index, next_display, ""


def ask_coach(message):
    if not message.strip():
        return "Ask a question first, e.g. \"How am I doing so far?\""
    return agent.ask_agent(message)


def final_report():
    return agent.ask_for_final_report()


with gr.Blocks(title="InterviewIQ") as demo:
    gr.Markdown("## InterviewIQ -- AI Mock Interview Coach")

    q_index_state = gr.State(0)
    question_display = gr.Markdown(f"**Q1.** {QUESTIONS[0]['question']}")
    answer_box = gr.Textbox(label="Your answer", lines=4)
    submit_btn = gr.Button("Submit Answer")
    feedback_box = gr.Markdown(label="Coach feedback")

    gr.Markdown("### Scorecard")
    scorecard_box = gr.Markdown("_No answers scored yet._")

    gr.Markdown("### Ask the coach (memory check)")
    meta_box = gr.Textbox(label='e.g. "How am I doing so far?" or "What is my weakest area?"')
    meta_btn = gr.Button("Ask")
    meta_reply = gr.Markdown()

    report_btn = gr.Button("Get Final Report")
    report_box = gr.Markdown()

    submit_btn.click(
        on_submit,
        inputs=[answer_box, q_index_state],
        outputs=[feedback_box, scorecard_box, q_index_state, question_display, answer_box],
    )
    meta_btn.click(ask_coach, inputs=meta_box, outputs=meta_reply)
    report_btn.click(final_report, outputs=report_box)

if __name__ == "__main__":
    demo.launch()
