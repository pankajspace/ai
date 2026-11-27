FROM python:3.11-slim

WORKDIR /app/frontend

COPY frontend/ .

RUN pip install --no-cache-dir -r requirements.txt

ENV PORT=7860
ENV BACKEND_URL=http://backend:8000

EXPOSE 7860

CMD ["python", "app.py"]
