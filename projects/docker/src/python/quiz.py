"""Docker Quiz — question bank and quiz logic.

This module holds a bank of Docker questions drawn from the study notes.  Each
question has four choices, one correct answer, and a short explanation.  The
quiz feature needs no API keys — it runs entirely from the built-in question
bank, so the project works out of the box like the template's echo feature.
"""

import random

# ---------------------------------------------------------------------------
# Question bank
# ---------------------------------------------------------------------------

# Each entry: (question, [choices], correct_index, explanation)
QUESTIONS = [
    (
        "What does the FROM instruction in a Dockerfile do?",
        [
            "Sets the working directory inside the container",
            "Specifies the base image to build upon",
            "Copies files from the host into the image",
            "Declares which port the container listens on",
        ],
        1,
        "FROM selects a ready-made base image (e.g. python:3.12-slim) from "
        "Docker Hub so you don't start from an empty computer.",
    ),
    (
        "Why should requirements.txt be copied BEFORE the rest of your code in a Dockerfile?",
        [
            "It makes the image smaller",
            "Python requires it to be installed first",
            "It enables layer caching — dependencies only reinstall when the list changes",
            "Docker cannot copy multiple files in one instruction",
        ],
        2,
        "Docker caches each layer. By copying only requirements.txt first, the "
        "pip install layer is reused on every code-only change, making rebuilds "
        "10x faster.",
    ),
    (
        "What does the -d flag mean in 'docker run -d'?",
        [
            "Debug mode — shows extra output",
            "Detached mode — runs the container in the background",
            "Delete mode — removes the container after it stops",
            "Dry-run mode — shows what would happen without executing",
        ],
        1,
        "-d runs the container in the background (detached) and returns your "
        "terminal. Without it, logs take over your terminal until you press "
        "Ctrl+C.",
    ),
    (
        "In the port mapping -p 8080:5000, what does the LEFT number represent?",
        [
            "The container's internal port",
            "The Docker daemon's port",
            "The host machine's port",
            "The Docker network port",
        ],
        2,
        "The format is host:container. The left number (8080) is the port on "
        "your Mac; the right (5000) is the port inside the container.",
    ),
    (
        "What happens when you edit your code but DON'T rebuild the image?",
        [
            "The container automatically picks up the changes",
            "Docker sends a warning notification",
            "Nothing — the container runs the old photograph of your code",
            "The container crashes and restarts",
        ],
        2,
        "An image is a photograph, not a mirror. When you build, Docker takes "
        "a snapshot. Editing code afterwards does NOT update the running "
        "container — you must rebuild.",
    ),
    (
        "What command lets you open a shell inside a running container?",
        [
            "docker logs -f <name>",
            "docker exec -it <name> bash",
            "docker inspect <name>",
            "docker attach <name>",
        ],
        1,
        "docker exec -it ... bash executes an interactive terminal inside the "
        "container. -it means interactive + terminal.",
    ),
    (
        "Why is 'docker ps -a' important for debugging?",
        [
            "It shows images instead of containers",
            "It reveals exited/crashed containers that plain 'docker ps' hides",
            "It displays network configurations",
            "It lists all available Docker commands",
        ],
        1,
        "Plain 'docker ps' only shows running containers. If a container "
        "crashed, it disappears from the list. 'ps -a' shows ALL containers "
        "including dead ones.",
    ),
    (
        "What is the purpose of a .dockerignore file?",
        [
            "It lists Docker commands to skip during the build",
            "It specifies which containers to ignore in compose",
            "It excludes files from being copied into the image during COPY",
            "It prevents certain images from being pulled",
        ],
        2,
        "When Docker sees COPY . ., it grabs everything — unless it's listed "
        "in .dockerignore. Exclude caches, .env secrets, venvs, and .git to "
        "keep the image small and secure.",
    ),
    (
        "What does 'docker compose up -d --build' do differently from 'docker compose up -d'?",
        [
            "It runs in debug mode",
            "It downloads newer base images",
            "It rebuilds images before starting, picking up code changes",
            "It builds only the first service",
        ],
        2,
        "--build forces a rebuild of your images before starting containers. "
        "Without it, Compose reuses old images and your code edits never "
        "arrive. Make it a habit after any file edit.",
    ),
    (
        "In Docker Compose, how does container A reach container B by name?",
        [
            "Using localhost and the published port",
            "Using the service name as the hostname and the INTERNAL port",
            "Using the container's IP address",
            "Using the host machine's IP and the mapped port",
        ],
        1,
        "Compose creates a private network where services reach each other by "
        "name (e.g. http://chroma:8000). Containers are neighbours inside the "
        "building — they use flat numbers (internal ports), not street gates "
        "(published ports).",
    ),
    (
        "What does 'depends_on' in docker-compose.yml guarantee?",
        [
            "That the dependency is fully ready to accept connections",
            "That the dependency's container is STARTED, but not necessarily ready",
            "That the dependency's healthcheck has passed",
            "That the dependency's ports are published",
        ],
        1,
        "depends_on only waits for the container to START, not for the service "
        "inside to be READY. That's why app code needs retry loops — the "
        "restaurant unlocked its door but the chef hasn't tied his apron yet.",
    ),
    (
        "Why should you NEVER put a real API key in a Dockerfile with ENV?",
        [
            "ENV variables are slower than .env files",
            "Anyone can read it back with 'docker history'",
            "Docker doesn't support ENV for secrets",
            "ENV only works in docker-compose.yml",
        ],
        1,
        "Image = ATM card (safe to share). Env var = PIN (inject at runtime). "
        "If you write ENV OPENAI_API_KEY=sk-... in a Dockerfile, anyone can "
        "read it with 'docker history'. Use .env + env_file instead.",
    ),
    (
        "What is a Docker volume used for?",
        [
            "Increasing container CPU allocation",
            "Persisting data that survives container deletion",
            "Mapping source code for hot-reloading only",
            "Sharing environment variables between containers",
        ],
        1,
        "Volumes are the steel box that comes back after every delivery. "
        "Delete the container, the data survives. 'docker compose down' "
        "keeps volumes; 'down -v' deletes them too.",
    ),
    (
        "What does WORKDIR /app do in a Dockerfile?",
        [
            "Creates and switches to /app as the working directory inside the image",
            "Mounts a volume at /app",
            "Copies files to /app on the host",
            "Sets /app as the entry point command",
        ],
        0,
        "WORKDIR sets the current directory inside the container for all "
        "subsequent instructions. It creates the folder if it doesn't exist. "
        "Like choosing which counter you'll cook on.",
    ),
    (
        "What does EXPOSE 5000 actually do?",
        [
            "Opens port 5000 on the host machine",
            "Nothing functional — it's documentation saying the app listens on 5000",
            "Maps port 5000 from container to host",
            "Blocks all other ports except 5000",
        ],
        1,
        "EXPOSE is just a label — documentation for humans. It does NOT open "
        "or map any ports. The actual port mapping is done by -p in docker run "
        "or ports: in docker-compose.yml.",
    ),
    (
        "What is the difference between CMD and RUN in a Dockerfile?",
        [
            "CMD runs during build; RUN runs when the container starts",
            "RUN runs during build; CMD runs when the container starts",
            "They are identical and interchangeable",
            "CMD can only be used once; RUN is unlimited",
        ],
        1,
        "RUN executes a command during the image BUILD (e.g. pip install). "
        "CMD is the one command that runs when a CONTAINER STARTS from the "
        "finished image (e.g. start the web server).",
    ),
    (
        "Why does a Flask/FastAPI app need '--host 0.0.0.0' inside a container?",
        [
            "It's required for HTTPS to work",
            "It speeds up response times",
            "Without it, the app only accepts connections from inside the container, not from outside",
            "It enables multi-threading",
        ],
        2,
        "By default, apps bind to 127.0.0.1 (localhost inside the container). "
        "0.0.0.0 means 'accept connections from anywhere', which is needed for "
        "port mapping to work — without it, -p silently fails.",
    ),
    (
        "What does 'docker compose down -v' do that 'docker compose down' does not?",
        [
            "It also removes the Docker images",
            "It also deletes named volumes — destroying persistent data",
            "It forces a rebuild of all images",
            "It also removes the Docker network",
        ],
        1,
        "down stops and removes containers and the network. down -v ALSO "
        "deletes volumes. This is how you actually lose your data. The steel "
        "dabba goes to the scrapyard.",
    ),
    (
        "In Docker, what is the relationship between an image and a container?",
        [
            "An image runs inside a container",
            "A container is a running instance of an image",
            "They are the same thing with different names",
            "A container creates images when it stops",
        ],
        1,
        "An image is the master tiffin (sealed, ready to ship). A container "
        "is one delivered tiffin — a running copy. One image can produce "
        "a hundred containers.",
    ),
    (
        "When a tools service has NO 'ports:' section in docker-compose.yml, what happens?",
        [
            "The service cannot start",
            "The service is reachable only by other services on the internal network",
            "Docker assigns a random published port",
            "The service can only be reached via docker exec",
        ],
        1,
        "No ports = no street gate = the outside world cannot reach it. Only "
        "fellow residents of the private Docker network (other services) can "
        "call it. This is the security gem — internal services stay internal.",
    ),
]


def get_question(question_id: int | None = None) -> dict:
    """Return a random quiz question (or a specific one by ID).

    Args:
        question_id: Optional 0-based index into the question bank.
            If ``None``, a random question is chosen.

    Returns:
        A dict with ``id``, ``question``, and ``choices`` keys.
        The correct answer is NOT included — use :func:`check_answer`.
    """
    if question_id is None:
        question_id = random.randint(0, len(QUESTIONS) - 1)
    question_id = max(0, min(question_id, len(QUESTIONS) - 1))

    question, choices, _, _ = QUESTIONS[question_id]
    return {
        "id": question_id,
        "question": question,
        "choices": choices,
        "total": len(QUESTIONS),
    }


def check_answer(question_id: int, answer_index: int) -> dict:
    """Validate a user's answer for a given question.

    Args:
        question_id: The 0-based question index returned by :func:`get_question`.
        answer_index: The 0-based index of the user's chosen answer.

    Returns:
        A dict with ``correct`` (bool), ``correct_index``, ``explanation``,
        and the user's ``answer_index``.
    """
    if question_id < 0 or question_id >= len(QUESTIONS):
        return {"error": "Invalid question ID."}

    _, choices, correct_index, explanation = QUESTIONS[question_id]

    if answer_index < 0 or answer_index >= len(choices):
        return {"error": "Invalid answer index."}

    return {
        "correct": answer_index == correct_index,
        "answer_index": answer_index,
        "correct_index": correct_index,
        "explanation": explanation,
    }


if __name__ == "__main__":
    # Allow running the quiz directly:  docker compose run --rm quiz
    print("🐳 Docker Quiz — answer by typing the number (1-4)\n")
    score = 0
    total = min(10, len(QUESTIONS))
    indices = random.sample(range(len(QUESTIONS)), total)

    for i, qid in enumerate(indices, 1):
        q = get_question(qid)
        print(f"Q{i}/{total}: {q['question']}")
        for j, choice in enumerate(q["choices"]):
            print(f"  {j + 1}. {choice}")

        while True:
            try:
                answer = int(input("Your answer: ")) - 1
                if 0 <= answer <= 3:
                    break
                print("Enter a number between 1 and 4.")
            except (ValueError, EOFError):
                print("Enter a number between 1 and 4.")

        result = check_answer(qid, answer)
        if result["correct"]:
            score += 1
            print(f"✅ Correct! {result['explanation']}\n")
        else:
            correct_text = q["choices"][result["correct_index"]]
            print(f"❌ Wrong — the answer is: {correct_text}")
            print(f"   {result['explanation']}\n")

    print(f"Final score: {score}/{total} 🐳")
