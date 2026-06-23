[<- AI Quick](00-ai-quick.md)

Got it 👍 — since you want a **flexible, topic-based roadmap**, I’ll give you a structured set of **topics → subtopics → resources → coding/research tasks**.
You can **jump around depending on interest**, but covering them all will give you a strong foundation for **research-level AI**.

---

# 🧭 Flexible Topic-Based Roadmap for Research AI

---

## 1. **Math for AI**

🔑 Why → Almost every new research paper is grounded in math.

* **Linear Algebra** → vectors, matrices, eigen decomposition, SVD
* **Probability & Statistics** → Bayes, KL divergence, distributions
* **Information Theory** → entropy, cross-entropy, mutual information
* **Optimization** → convex vs. non-convex, gradient descent, Lagrangians

📘 Resources:

* *Mathematics for Machine Learning* (book, Deisenroth et al.)
* MIT OCW – Linear Algebra, Probability

💻 Task: Implement gradient descent from scratch on a quadratic function, visualize convergence.

---

## 2. **Classical Machine Learning**

🔑 Why → Many deep learning papers borrow from ML theory.

* Regression, classification
* Kernel methods (SVMs, Gaussian Processes)
* Ensemble methods (Boosting, Bagging)
* Bias-variance, generalization bounds

📘 Resources:

* *Elements of Statistical Learning* (Hastie et al.)
* *Understanding Machine Learning* (Shalev-Shwartz)

💻 Task: Implement logistic regression + SVM **from scratch** (no sklearn). Compare with sklearn’s implementation.

---

## 3. **Deep Learning Foundations**

🔑 Why → Core to most modern research.

* Feedforward neural networks (from scratch derivation of backprop)
* CNNs (image processing)
* RNNs, LSTMs, GRUs (sequences)
* Optimization tricks: momentum, Adam, learning rate schedules
* Regularization: dropout, batch norm, weight decay

📘 Resources:

* *Deep Learning* (Goodfellow, Bengio, Courville)
* *Dive into Deep Learning* (free interactive book)

💻 Task: Implement a CNN from scratch (NumPy) → then replicate in PyTorch. Compare training speed & accuracy.

---

## 4. **Modern Architectures**

🔑 Why → These are the backbone of cutting-edge research.

* **Attention & Transformers** → Self-attention, multi-head, positional encoding
* **Vision Transformers (ViT)**
* **Graph Neural Networks (GNNs)**
* **Diffusion Models** (Stable Diffusion, DDPMs)
* **Large Language Models (LLMs)** → scaling laws, pretraining, fine-tuning

📘 Resources:

* "Attention Is All You Need" (Vaswani et al., 2017)
* Hugging Face course (Transformers)
* *Lil’Log* blog (excellent for intuitive math-heavy explainers)

💻 Task: Implement a mini-Transformer from scratch, train it on character-level text generation.

---

## 5. **Reinforcement Learning (RL)**

🔑 Why → Many breakthroughs (AlphaGo, AlphaZero, RLHF for LLMs).

* MDPs, value functions, Bellman equations
* Policy gradients, Actor-Critic, PPO
* Exploration vs exploitation
* Multi-agent RL

📘 Resources:

* Sutton & Barto, *Reinforcement Learning: An Introduction*
* Spinning Up (OpenAI)

💻 Task: Implement Q-learning on OpenAI Gym’s CartPole, then upgrade to PPO.

---

## 6. **Self-Supervised & Generative AI**

🔑 Why → Most modern research is moving here.

* Autoencoders, Variational Autoencoders (VAE)
* Generative Adversarial Networks (GANs)
* Contrastive learning (SimCLR, BYOL)
* Diffusion models

📘 Resources:

* *Tutorial: Auto-Encoding Variational Bayes (Kingma & Welling)*
* *GANs in Action* (book)
* Diffusion papers (DDPM, Stable Diffusion)

💻 Task: Implement a simple VAE and train it on MNIST. Compare to a GAN.

---

## 7. **Theoretical Machine Learning**

🔑 Why → True research requires **rigorous grounding**.

* PAC learning, VC dimension
* Generalization bounds
* Double descent phenomena in deep networks
* Information bottleneck theory

📘 Resources:

* *Understanding Machine Learning* (Shalev-Shwartz)
* *Deep Learning Theory Summer School* (YouTube, recent talks)

💻 Task: Study double descent by training increasingly wide/deep networks on CIFAR-10 and plotting error vs. capacity.

---

## 8. **Research Skills**

🔑 Why → Reading + reproducing papers = core to research career.

* **Read papers** efficiently (abstract → diagrams → math → experiments → appendix)
* **Reproduce results** from a recent paper (with/without official code)
* **Do ablation studies** (test variants of published methods)
* **Write in LaTeX** for paper prep

📘 Resources:

* Distill.pub (for intuitive paper explainers)
* ArXiv Sanity Preserver (curated papers)
* “How to Read a Paper” (Keshav)

💻 Task: Pick one NeurIPS/ICLR paper → reproduce experiments + write a blog summary.

---

# ⚡ How to Use This Roadmap

* Think of each topic as a **module** (Math, ML, DL, Transformers, RL, etc.).
* You don’t need to go strictly in order — e.g., if **Transformers excite you**, start there while doing math in parallel.
* For every **paper you read**, either (a) **implement it from scratch**, or (b) **reproduce results**, or (c) **do an ablation study**.

---

👉 Would you like me to now **map these topics into a “research progression path”** (like: start with simple ML papers → move to CNN papers → then Transformer papers → then propose your own idea), so you have a clear sequence for becoming a **paper-publishing researcher**?
