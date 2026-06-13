import json
import os
import time
from typing import Any

from fastapi import HTTPException
from google import genai
from google.genai import types


class AIService:
    RETRYABLE_ERROR_MARKERS = (
        "503",
        "UNAVAILABLE",
        "429",
        "RESOURCE_EXHAUSTED",
        "high demand",
        "rate limit",
    )

    def __init__(self) -> None:
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("GEMINI_MODEL") or os.getenv("OPENAI_MODEL", "gemini-3.5-flash")
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None

    def _safe_json(self, content: str) -> Any:
        try:
            return json.loads(content)
        except json.JSONDecodeError as exc:
            raise ValueError("AI response was not valid JSON") from exc

    def _is_retryable_error(self, exc: Exception) -> bool:
        message = str(exc)
        return any(marker in message for marker in self.RETRYABLE_ERROR_MARKERS)

    def _generate_json_response(self, prompt: str, temperature: float) -> Any:
        last_error = None
        for attempt in range(3):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=temperature,
                        response_mime_type="application/json",
                    ),
                )
                return self._safe_json(response.text)
            except Exception as exc:
                last_error = exc
                if not self._is_retryable_error(exc) or attempt == 2:
                    break
                time.sleep(2 ** attempt)

        raise HTTPException(
            status_code=503,
            detail=f"Gemini is temporarily unavailable. Please try again shortly. Details: {last_error}",
        ) from last_error

    def _normalize_role(self, role: str) -> str:
        return " ".join(role.split())

    def _normalize_difficulty(self, difficulty: str) -> str:
        return " ".join(difficulty.split()).title()

    def _normalize_question_types(self, question_types: list[str] | None) -> list[str]:
        if not question_types:
            return ["Technical"]

        normalized = []
        seen = set()
        for item in question_types:
            value = " ".join(item.split())
            key = value.casefold()
            if not value or key in seen:
                continue
            seen.add(key)
            normalized.append(value)
        return normalized or ["Technical"]

    def generate_questions(
        self,
        role: str,
        difficulty: str,
        question_types: list[str],
        count: int,
        context_text: str | None = None,
        mode: str = "general",
    ) -> list[dict]:
        role = self._normalize_role(role)
        difficulty = self._normalize_difficulty(difficulty)
        question_types = self._normalize_question_types(question_types)

        if not self.client:
            raise HTTPException(status_code=503, detail="Gemini API key is not configured.")

        if mode == "resume":
            prompt = (
                "You are an expert recruiter and technical interviewer.\n"
                f"Analyze the following resume text:\n\n{context_text}\n\n"
                f"Generate personalized interview questions for the role: {role}.\n"
                "Focus on the candidate's skills, projects, tools, technologies, and experience.\n"
                f"Target difficulty: {difficulty}. Generate {count} questions.\n"
                "Include technical, project-based, and HR questions.\n"
                "For expected_answer, provide an interviewer-satisfying sample answer in first person, not generic advice.\n"
                "Each expected_answer should be easy to understand, well-structured, and broken into short readable paragraphs.\n"
                "Use simple direct language, but keep the technical quality high.\n"
                "Each answer should include: the situation or goal, the approach, key tradeoffs, and the measurable result or validation.\n"
                "Format expected_answer in a clean markdown-like style using short paragraphs, numbered steps when helpful, bullet points for tools or tradeoffs, and **bold labels** for sections.\n"
                "Return valid JSON only as an array of objects with keys: question, explanation, expected_answer, key_points, difficulty, category, question_type."
            )
        elif mode == "job_description":
            prompt = (
                "You are an expert interviewer.\n"
                f"Analyze the following job description:\n\n{context_text}\n\n"
                f"Generate {count} interview questions for the role: {role}.\n"
                f"Difficulty level: {difficulty}.\n"
                "Generate questions that test the required skills, responsibilities, tools, and technologies mentioned in the job description.\n"
                "For expected_answer, provide an interviewer-satisfying sample answer in first person, not generic advice.\n"
                "Each expected_answer should be easy to understand, well-structured, and broken into short readable paragraphs.\n"
                "Use simple direct language, but keep the technical quality high.\n"
                "Each answer should include: the situation or goal, the approach, key tradeoffs, and the measurable result or validation.\n"
                "Format expected_answer in a clean markdown-like style using short paragraphs, numbered steps when helpful, bullet points for tools or tradeoffs, and **bold labels** for sections.\n"
                "Return valid JSON only as an array of objects with keys: question, explanation, expected_answer, key_points, difficulty, category, question_type."
            )
        else:
            prompt = (
                "You are an expert technical interviewer.\n"
                f"Generate interview questions for the role: {role}.\n"
                f"Difficulty level: {difficulty}.\n"
                f"Question types: {', '.join(question_types)}.\n"
                f"Number of questions: {count}.\n"
                "For each question, return: question, explanation, expected_answer, key_points, difficulty, category, question_type.\n"
                "The expected_answer must be a strong sample answer that could satisfy an interviewer, written in first person with concrete technical reasoning.\n"
                "Make each expected_answer easy to understand and attractive to read: use short readable paragraphs, clear sequencing, and direct language.\n"
                "Each answer should cover: the goal, what I would do, key tradeoffs, and how I would validate the outcome.\n"
                "Format expected_answer in a clean markdown-like style using short paragraphs, numbered steps when helpful, bullet points for tools or tradeoffs, and **bold labels** for sections.\n"
                "Do not write generic guidance like 'a strong answer should'. Write the actual answer the candidate could give.\n"
                "If the question_type is Coding, also include a details object with problem_statement, input_format, output_format, example_input, example_output, constraints, approach_explanation, time_complexity, space_complexity, solution_code.\n"
                "Return valid JSON only."
            )

        parsed = self._generate_json_response(prompt, temperature=0.7)
        if not isinstance(parsed, list):
            raise HTTPException(status_code=502, detail="Gemini returned an invalid question payload.")
        return self._merge_unique_questions(parsed, role, difficulty, question_types, count, context_text)

    def _merge_unique_questions(
        self,
        questions: list[dict],
        role: str,
        difficulty: str,
        question_types: list[str],
        count: int,
        context_text: str | None,
    ) -> list[dict]:
        unique = []
        seen = set()

        for item in questions:
            if not isinstance(item, dict):
                raise HTTPException(status_code=502, detail="Gemini returned an invalid question item.")
            question = item.get("question")
            if not isinstance(question, str):
                raise HTTPException(status_code=502, detail="Gemini returned a question without valid text.")
            key = " ".join(question.split()).casefold()
            if key in seen:
                continue
            seen.add(key)
            required_fields = ("expected_answer", "category", "question_type", "key_points")
            missing_fields = [field for field in required_fields if field not in item or item.get(field) in (None, "")]
            if missing_fields:
                raise HTTPException(
                    status_code=502,
                    detail=f"Gemini returned an incomplete question payload. Missing fields: {', '.join(missing_fields)}.",
                )
            if not isinstance(item["key_points"], list):
                raise HTTPException(status_code=502, detail="Gemini returned invalid key_points format.")
            item["difficulty"] = item.get("difficulty") or difficulty
            unique.append(item)
            if len(unique) == count:
                return unique

        raise HTTPException(
            status_code=502,
            detail=f"Gemini returned only {len(unique)} unique questions out of the requested {count}.",
        )

    def evaluate_mock_answer(self, question: str, user_answer: str, role: str) -> dict:
        if not self.client:
            raise HTTPException(status_code=503, detail="Gemini API key is not configured.")

        prompt = (
            "You are an expert interview evaluator.\n"
            "Evaluate the user's answer.\n\n"
            f"Interview question:\n{question}\n\n"
            f"User answer:\n{user_answer}\n\n"
            f"Role:\n{role}\n\n"
            "Return valid JSON only with keys: score, feedback, strengths, weaknesses, missing_points, improved_answer."
        )
        parsed = self._generate_json_response(prompt, temperature=0.4)
        if not isinstance(parsed, dict):
            raise HTTPException(status_code=502, detail="Gemini returned an invalid evaluation payload.")
        return parsed


ai_service = AIService()
