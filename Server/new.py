from langgraph.graph import END, Graph
from langchain_ollama import OllamaLLM
from langchain.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel
from typing import Optional
from elevenlabs import ElevenLabs
from elevenlabs import play
import threading
from dotenv import load_dotenv
import os


client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

llm = OllamaLLM(model="llama3.2")

class ChatRequest(BaseModel):
    message: str
    topic: Optional[str] = None

# Define Interview State
class InterviewState:
    def __init__(self, topic):
        self.topic = topic
        self.question = None
        self.answer = None
        self.feedback = None
        self.history = []
        self.final_summary = None
        self.question_count = 0
        self.step = "ask_question"

def generate_question(topic, question_count):
    try:
        prompt = f"""
        You are a professional technical interviewer.

        Your task is to ask **ONE** interview question on the given topic.

        Guidelines:
        - Topic: {topic}
        - Difficulty: Basic to Intermediate
        - Question Type: Prefer logical or theoretical. Avoid coding questions.
        - If asking a case-based question, include context.
        - This is question #{question_count}.
        - Start with intermediate questions and as the question count increases ask more advanced questions.
        - Do not include intros like "Here's your question."
        - Ask questions that require explanation or discussion, not just yes/no answers.

        Respond with only the question text.
        """
        template = ChatPromptTemplate.from_messages([
            SystemMessage(content=prompt),
            HumanMessage(content=topic)
        ])
        response = llm.invoke(template.format_prompt(topic=topic).to_string())
        question = response.strip()
        question = question.replace("Here's your first question:", "").strip()
        question = question.replace("Here's your question:", "").strip()
        question = question.replace("Here is your question:", "").strip()
        return f"Question #{question_count}: {question}"
    except Exception as e:
        print(f"Error generating question: {str(e)}")
        return f"Question #{question_count}: Can you tell me about your experience with {topic}?"

def generate_feedback(question, answer):
    try:
        if not answer:
            return "Error: The answer cannot be empty."

        prompt = f"""
           You are an AI interview evaluator. Evaluate the candidate's response:

        **Question:** {question}  
        **Candidate's Answer:** {answer}  

        **Evaluation Criteria:**
        1. Correctness - Is the answer factually correct?
        2. Completeness – Does it fully address the question?
        3. Clarity – Is the explanation well-structured?
        4. Depth – Does it show in-depth understanding?
        5. Conciseness – Is the response to the point?

        **Output Format:**
        - **Overall Assessment:** Brief summary.
        - **Strengths:** What was done well?
        - **Areas for Improvement:** What can be improved?
        - **Score (out of 10):** Rating based on evaluation.

        Now, generate the feedback
        """
        template = ChatPromptTemplate.from_messages([
            SystemMessage(content=prompt),
            HumanMessage(content=answer)
        ])
        response = llm.invoke(template.format_prompt(question=question, answer=answer).to_string())
        return response.strip()
    except Exception as e:
        print(f"Error generating feedback: {str(e)}")
        return "Thank you for your answer. Let's continue with the next question."

def generate_summary(history, topic):
    try:
        prompt = f"""
        You are an AI interviewer summarizing a technical interview about {topic}.
        
        Review the following interview session:
        
        {history}
        
        Provide a comprehensive summary including:
        1. Overall performance assessment
        2. Key strengths demonstrated
        3. Areas for improvement
        4. Final score (out of 10)
        5. Tips for future interviews on this topic
        """
        
        template = ChatPromptTemplate.from_messages([
            SystemMessage(content=prompt),
            HumanMessage(content=str(history))
        ])
        
        response = llm.invoke(template.format_prompt(history=history, topic=topic).to_string())
        return response.strip()
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return "Thank you for completing the interview session."

def evaluate_answer(state):
    try:
        if not state.answer:
            state.feedback = "No answer provided."
        else:
            state.feedback = generate_feedback(state.question, state.answer)
        state.history.append({"question": state.question, "answer": state.answer, "feedback": state.feedback})
        state.step = "ask_question"
        return state
    except Exception as e:
        print(f"Error evaluating answer: {str(e)}")
        state.feedback = "Thank you for your answer."
        state.history.append({"question": state.question, "answer": state.answer, "feedback": state.feedback})
        return state

def ask_question(state):
    try:
        state.question_count += 1
        state.question = generate_question(state.topic, state.question_count)
        audio = client.generate(
            text=state.question,
            voice="Jessica",
            model="eleven_multilingual_v2"
        )

        threading.Thread(target=lambda: play(audio)).start()
        state.answer = None
        state.feedback = None
        state.step = "evaluate_answer"
        return state
    except Exception as e:
        print(f"Error asking question: {str(e)}")
        state.question = f"Can you explain a key concept in {state.topic}?"
        return state

def should_continue(state: InterviewState) -> str:
    """Always continue asking questions in a loop until manually ended."""
    return "continue"

ask_graph = Graph()
ask_graph.add_node("ask_question", ask_question)
ask_graph.set_entry_point("ask_question")
ask_graph.add_edge("ask_question", END)
ask_graph = ask_graph.compile()

eval_graph = Graph()
eval_graph.add_node("evaluate_answer", evaluate_answer)
eval_graph.set_entry_point("evaluate_answer")
eval_graph.add_edge("evaluate_answer", END)
eval_graph = eval_graph.compile()

def process_interview_step(state):
    """Process the current interview step based on state.step"""
    if state.step == "ask_question":
        # Generate a new question
        return ask_graph.invoke(state)
    elif state.step == "evaluate_answer":
        # Evaluate the user's answer
        return eval_graph.invoke(state)
    else:
        raise ValueError(f"Unknown step: {state.step}")

def state_to_dict(state):
    return {
        "topic": state.topic,
        "question": state.question,
        "answer": state.answer,
        "feedback": state.feedback,
        "history": state.history,
        "final_summary": state.final_summary,
        "question_count": state.question_count,
        "step": state.step
    }

def dict_to_state(data):
    state = InterviewState(data["topic"])
    state.question = data.get("question")
    state.answer = data.get("answer")
    state.feedback = data.get("feedback")
    state.history = data.get("history", [])
    state.final_summary = data.get("final_summary")
    state.question_count = data.get("question_count", 0)
    state.step = data.get("step", "ask_question")
    return state

