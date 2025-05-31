from flask import Blueprint, request, jsonify, session, render_template
from new import process_interview_step, InterviewState, state_to_dict, dict_to_state, ChatRequest, generate_summary, llm
import traceback
import jwt
from dotenv import load_dotenv
import os

load_dotenv()
main = Blueprint('main', __name__)

@main.route("/")
def home():
    try:
        return render_template("index.html")
    except Exception as e:
        return f"Error loading template: {str(e)}", 500

@main.route("/ping")
def ping():
    """Simple endpoint to check if server is running"""
    return jsonify({"status": "ok"})

@main.route("/chat", methods=["POST"])
def chat():
    try:
        # Authentication check
        token = request.cookies.get("token")  
        if not token:
            return jsonify({"error": "Missing auth token"}), 401

        jwtsecret = os.getenv("JWT_SECRET")
        decoded = jwt.decode(token, jwtsecret, algorithms=["HS256"])
        user_id = decoded.get("userID")
        username = decoded.get("username")

        print("Authenticated user:", username)

        # Parse request data
        json_data = request.get_json(force=True, silent=True)
        if json_data is None:
            raise ValueError("Invalid or missing JSON")

        chat_data = ChatRequest(**json_data)
        user_input = chat_data.message.strip()
        topic = chat_data.topic

        print(f"Received chat request: message='{user_input}', topic='{topic}'")

        # Case 1: Starting a new interview session
        if user_input == "start" and topic:
            print(f"Starting new interview session with topic: '{topic}'")
            state = InterviewState(topic)
            state.step = "ask_question"
            state = process_interview_step(state)
            session["state"] = state_to_dict(state)
            return jsonify({"question": state.question})

        # Case 2: No active session
        if "state" not in session:
            print("Error: No active session found")
            return jsonify({"error": "No active session. Please start a new topic."}), 400

        # Case 3: Continue existing session with user answer
        state = dict_to_state(session["state"])
        state.answer = user_input
        print(f"Processing user response to question: '{state.question}'")
        state = process_interview_step(state)
        feedback = state.feedback
        state = process_interview_step(state)
        
        # Save updated state to session
        session["state"] = state_to_dict(state)

        return jsonify({
            # "feedback": feedback,
            "nextQuestion": state.question
        })

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@main.route("/end", methods=["POST"])
def end_session():
    try:
        if "state" not in session:
            return jsonify({"error": "No session to end."}), 400

        state = dict_to_state(session["state"])
        
        try:
            summary = generate_summary(state.history, state.topic)
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            try:
                feedback_text = "\n".join(
                    f"Q: {item.get('question', '')}\nA: {item.get('answer', '')}\nFeedback: {item.get('feedback', '')}"
                    for item in state.history if "answer" in item
                )
                
                prompt = f"""
                You are an AI interview evaluator. Summarize this technical interview about {state.topic}:
                
                {feedback_text}
                
                Provide:
                1. Overall performance assessment
                2. Key strengths demonstrated
                3. Areas for improvement
                4. Final score (out of 10)
                5. Tips for future interviews on this topic
                """
                summary = llm.invoke(prompt).strip()
            except Exception as e2:
                print(f"Error with fallback summary method: {str(e2)}")
                summary = "Thank you for completing the interview practice session!"
            
        # Store summary and clear session
        state.final_summary = summary
        session.pop("state", None)

        return jsonify({"summary": summary})
    except Exception as e:
        print(f"Error in end session endpoint: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    
@main.route("/reset", methods=["POST"])
def reset_session():
    """Clear the current session state"""
    session.pop("state", None)
    return jsonify({"message": "Session reset successfully."})