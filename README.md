Chatbot with Multi-Repository Support
This project is a chatbot application designed to interact with multiple repositories or namespaces. It allows users to select and chat with specific namespaces or multiple namespaces simultaneously. The chatbot leverages Supabase for message storage, PrismJS for code syntax highlighting, and ReactMarkdown for rendering formatted content.

Features
Single Repository Chat: Users can interact with a selected repository to ask questions and get responses.
Multi-Repository Chat: Users can select multiple repositories (or namespaces) to have a combined chat experience, allowing the chatbot to pull responses from different repositories.
Code Syntax Highlighting: Code snippets are highlighted using PrismJS for a better user experience.
Message History: Chats are stored in Supabase to keep track of past conversations for each repository.
Interactive UI: A clean and responsive UI that allows easy switching between single and multi-repository chats.
Technologies Used
React: Frontend library for building the user interface.
Supabase: Backend service for handling message storage and retrieval.
PrismJS: Code syntax highlighting library.
ReactMarkdown: Library for rendering Markdown content.
CSS: For styling the app.
Setup
Prerequisites
Node.js (v16 or higher)
Supabase account and a project setup
NPM or Yarn package manager
Clone the Repository
bash
Copy code
git clone https://github.com/yourusername/chatbot-multi-repository.git
cd chatbot-multi-repository
Install Dependencies
Install the required dependencies using npm or yarn:

bash
Copy code
npm install
or

bash
Copy code
yarn install
Environment Configuration
Create a .env file in the root directory and add the following configuration:

bash
Copy code
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_key
Replace your_supabase_url and your_supabase_key with the actual Supabase credentials from your project.

Run the Application
To start the development server:

bash
Copy code
npm run dev
or

bash
Copy code
yarn dev
The app will be available at http://localhost:3000.

Usage
On the home screen, you can select a namespace (repository) from the sidebar.
To start a chat, type your question in the input field and click "Send."
You can also start a multi-repository chat by clicking the Start Multi-Repository Chat button, where you can select multiple namespaces for a combined chat experience.
The chatbot will respond with messages based on the repositories you select.
API Endpoints
/api/get_namespaces
Method: GET
Description: Fetches the list of namespaces (repositories) available for chat.
Response: Returns an object with a list of namespaces.
/api/get_details
Method: POST

Description: Sends a user query to the backend and retrieves the bot's response for a specific namespace.

Request Body:

json
Copy code
{
  "query": "Your question",
  "namespace": "selected_namespace"
}
Response: Returns the bot's response to the query.

/api/get_multi_details
Method: POST

Description: Sends a user query to the backend and retrieves the bot's response for multiple selected namespaces.

Request Body:

json
Copy code
{
  "query": "Your question",
  "namespaces": ["namespace1", "namespace2"]
}
Response: Returns the bot's response to the query for the selected namespaces.

Contributing
Fork the repository.
Create a new branch (git checkout -b feature-name).
Commit your changes (git commit -am 'Add new feature').
Push to the branch (git push origin feature-name).
Open a pull request.
