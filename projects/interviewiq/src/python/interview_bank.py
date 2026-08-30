"""Interview Question Bank for InterviewIQ.

Contains categorized interview questions along with expected key concepts,
and sample strong & weak answers for testing and demonstration.
"""

QUESTIONS = [
    {
        "id": 1,
        "category": "Behavioral",
        "question": "Tell me about a time you had a major conflict or disagreement with a teammate and how you handled it.",
        "expected_keywords": [
            "conflict", "disagreement", "perspective", "listen", "communication",
            "compromise", "resolution", "collaborate", "respect", "team",
            "alignment", "outcome",
        ],
        "sample_strong_answer": (
            "In my previous role as a senior engineer, our team encountered a major "
            "conflict and technical disagreement regarding our API architecture. My "
            "task was to facilitate open communication and achieve a win-win "
            "resolution. I respected every teammate's perspective and actively "
            "listened during technical review meetings. I encouraged both sides to "
            "collaborate and propose a practical compromise. As a result, we achieved "
            "full team alignment, successfully resolved the dispute, and delivered a "
            "positive business outcome with a 35% performance gain."
        ),
        "sample_weak_answer": (
            "Um, basically, like, someone disagreed with my PR and was arguing with "
            "me. I know I was right so I just told them to look at the code again. "
            "Eventually they gave up and approved it, you know."
        ),
    },
    {
        "id": 2,
        "category": "Technical",
        "question": "How do you design a scalable microservices architecture and manage reliable inter-service communication?",
        "expected_keywords": [
            "microservices", "api gateway", "rest", "grpc", "async",
            "message queue", "kafka", "rabbitmq", "event-driven",
            "load balancer", "circuit breaker", "resilience",
            "database per service", "caching", "idempotency", "scalability",
        ],
        "sample_strong_answer": (
            "To design a high-scalability microservices architecture, I decouple "
            "services using the database per service pattern. For external client "
            "ingress, I deploy an API Gateway with load balancer and rate limiting. "
            "For high-throughput inter-service communication, I implement "
            "asynchronous event-driven message queue systems using Kafka or RabbitMQ "
            "with idempotency guarantees. For low-latency synchronous RPC calls, I "
            "use gRPC protected by circuit breaker patterns to guarantee system "
            "resilience. Finally, distributed Redis caching and REST APIs ensure "
            "high performance and loose coupling."
        ),
        "sample_weak_answer": (
            "Well, microservices are just splitting code into multiple servers. You "
            "just make REST API calls between them and use a single database that "
            "everyone connects to so data stays in sync."
        ),
    },
    {
        "id": 3,
        "category": "Problem-Solving",
        "question": "Describe a critical production incident or bug you diagnosed and resolved under pressure.",
        "expected_keywords": [
            "incident", "production", "monitoring", "logs", "metrics",
            "root cause", "debug", "reproduce", "patch", "rollback",
            "post-mortem", "alert", "latency",
        ],
        "sample_strong_answer": (
            "During a high-severity production incident with elevated latency, our "
            "monitoring alerts triggered on payment failures. As incident commander, "
            "I analyzed APM metrics and distributed server logs to debug and isolate "
            "the root cause: an unindexed database query causing connection pool "
            "deadlocks. I immediately initiated a safe rollback to restore production "
            "stability within 8 minutes. Once stable, we reproduced the issue in "
            "staging, deployed a tested patch, and published a blameless post-mortem "
            "with new monitoring alerts."
        ),
        "sample_weak_answer": (
            "Uh, yeah, one day the website was down. Basically I restarted the "
            "server and it worked again. I don't know exactly what happened, but "
            "restarting fixed it, like, right away."
        ),
    },
    {
        "id": 4,
        "category": "Leadership",
        "question": "Tell me about a high-stakes project you led where you had to manage tight deadlines and shifting requirements.",
        "expected_keywords": [
            "leadership", "prioritize", "delegate", "deadline", "milestones",
            "stakeholders", "scope", "communication", "delivery", "risk",
            "alignment", "impact",
        ],
        "sample_strong_answer": (
            "When tasked with leadership on an enterprise compliance initiative with "
            "an aggressive 60-day deadline, my objective was on-time delivery without "
            "compromising security. I established 2-week sprint milestones, "
            "prioritized mission-critical security controls, and delegated "
            "specialized tasks across three engineering teams. I maintained "
            "transparent communication and weekly alignment sessions with executive "
            "stakeholders to manage scope and mitigate delivery risks. As a result of "
            "this leadership, we passed the audit with zero defects ahead of deadline "
            "and achieved a $1.2M revenue impact."
        ),
        "sample_weak_answer": (
            "Like, we had a really short deadline from our manager. We worked late "
            "hours every day and pushed everyone to finish. It was stressful but we "
            "got it done, you know."
        ),
    },
    {
        "id": 5,
        "category": "System Design",
        "question": "How would you design a distributed URL shortening service like TinyURL capable of handling billions of redirects?",
        "expected_keywords": [
            "url shortener", "hash", "base62", "encoding", "collisions",
            "database", "nosql", "redis", "cache", "load balancing", "cdn",
            "throughput", "capacity", "zookeeper",
        ],
        "sample_strong_answer": (
            "To design a high-throughput distributed url shortener service handling "
            "billions of redirects, I estimate capacity for a 100:1 read-to-write "
            "ratio. I utilize Base62 encoding on unique 64-bit integer IDs generated "
            "by a distributed counter with ZooKeeper coordination to guarantee zero "
            "collisions without hash retry penalties. For persistence, I use a "
            "distributed NoSQL database partitioned by short key. To maximize "
            "throughput, I place a multi-tier Redis cache cluster behind Anycast CDN "
            "and load balancing tiers."
        ),
        "sample_weak_answer": (
            "You take a long URL, run MD5 hash on it, take the first 6 letters, and "
            "save it in a MySQL table. When someone requests it, query the table and "
            "redirect."
        ),
    },
]


def get_all_questions() -> list[dict]:
    """Return all available questions."""
    return QUESTIONS


def get_question_by_id(question_id: int) -> dict | None:
    """Retrieve a specific question by its ID."""
    for q in QUESTIONS:
        if q["id"] == question_id:
            return q
    return None


def get_question_categories() -> list[str]:
    """Return unique categories across the question bank."""
    return list(dict.fromkeys(q["category"] for q in QUESTIONS))

