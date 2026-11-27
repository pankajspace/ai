import os
import uuid
import requests
from dotenv import load_dotenv
import gradio as gr

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
API_KEY = os.getenv("API_KEY", "dev-secret")
HEADERS = {"X-API-Key": API_KEY}

# One session ID per server instance (good enough for local/single-user)
SESSION_ID = str(uuid.uuid4())


def chat(user_message: str, history: list, sku_id: str) -> tuple[str, list]:
    """Send message to backend and return updated history."""
    # Convert gradio history format (list of dicts) to backend format
    backend_history = []
    for msg in history:
        if isinstance(msg, dict):
            backend_history.append({"role": msg["role"], "content": msg["content"]})
        else:
            # fallback for tuple format
            human, assistant = msg
            backend_history.append({"role": "user", "content": human})
            if assistant:
                backend_history.append({"role": "assistant", "content": assistant})

    payload = {
        "query": user_message,
        "session_id": SESSION_ID,
        "sku_id": sku_id.strip() or None,
        "history": backend_history,
    }

    try:
        resp = requests.post(f"{BACKEND_URL}/chat", json=payload, headers=HEADERS, timeout=60)
        resp.raise_for_status()
        agent_reply = resp.json()["response"]
    except requests.exceptions.ConnectionError:
        agent_reply = "Error: Cannot reach the backend. Make sure the backend server is running."
    except requests.exceptions.HTTPError as e:
        agent_reply = f"Backend error {e.response.status_code}: {e.response.text}"
    except Exception as e:
        agent_reply = f"Unexpected error: {e}"

    history.append({"role": "user", "content": user_message})
    history.append({"role": "assistant", "content": agent_reply})
    return "", history


def lookup_sku(sku_id: str) -> str:
    if not sku_id.strip():
        return "Enter a SKU ID above and click Lookup."
    try:
        resp = requests.get(f"{BACKEND_URL}/inventory/{sku_id.strip().upper()}", headers=HEADERS, timeout=10)
        if resp.status_code == 404:
            return f"SKU '{sku_id}' not found in database."
        resp.raise_for_status()
        data = resp.json()
        return (
            f"**{data['sku_id']}** — {data.get('name', 'N/A')}\n"
            f"- Current Inventory: {data['current_inventory']} units\n"
            f"- Avg Demand: {data['avg_demand']} units/day\n"
            f"- Lead Time: {data['lead_time']} days\n"
            f"- Safety Stock: {data['safety_stock']} units"
        )
    except Exception as e:
        return f"Error: {e}"


# ---------------------------------------------------------------------------
# UI Layout
# ---------------------------------------------------------------------------

with gr.Blocks(title="Inventory Planning Agent") as demo:
    gr.Markdown("# Inventory Planning Agent\nAsk me about reorder decisions, stock levels, or supply planning.")

    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### SKU Context (optional)")
            sku_input = gr.Textbox(label="SKU ID", placeholder="e.g. SKU001")
            lookup_btn = gr.Button("Lookup SKU")
            sku_info = gr.Markdown("Enter a SKU ID above and click Lookup.")

            gr.Markdown("### Example Questions")
            gr.Markdown(
                "- Should I reorder SKU001?\n"
                "- Inventory is 50, demand is 8/day, lead time is 5 days. What do I do?\n"
                "- How much should I order for SKU002?"
            )

        with gr.Column(scale=2):
            chatbot = gr.Chatbot(height=500, label="Chat")  # Gradio 6: messages format (list of dicts)
            msg_input = gr.Textbox(
                placeholder="Ask about inventory...",
                label="Your message",
                lines=2,
            )
            with gr.Row():
                send_btn = gr.Button("Send", variant="primary")
                clear_btn = gr.Button("Clear")

    # Events
    send_btn.click(
        fn=chat,
        inputs=[msg_input, chatbot, sku_input],
        outputs=[msg_input, chatbot],
    )
    msg_input.submit(
        fn=chat,
        inputs=[msg_input, chatbot, sku_input],
        outputs=[msg_input, chatbot],
    )
    clear_btn.click(fn=lambda: ([], ""), outputs=[chatbot, msg_input])
    lookup_btn.click(fn=lookup_sku, inputs=[sku_input], outputs=[sku_info])


if __name__ == "__main__":
    port = int(os.getenv("PORT", 7860))
    demo.queue()
    demo.launch(server_name="0.0.0.0", server_port=port)
