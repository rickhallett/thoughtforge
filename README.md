📚 ThoughtForge

Welcome to ThoughtForge. This app is designed to automate and streamline the process of transforming raw content into polished articles ready for publishing across multiple channels. The initial focus is on developing a robust end-to-end pipeline as a proof of concept, but the goal is to eventually convert this into a scalable SaaS platform.

📚 Documentation

[Backend Roadmap](docs/backend-roadmap.md) (est. 1-2 weeks FTE 1.0)
[DB Design](docs/db-design.md)
[Frontend Roadmap](docs/frontend-roadmap.md) (est. 1-2 weeks FTE 1.0)
[AI Roadmap](docs/ai-roadmap.md) (est. 4-6 weeks FTE 1.0)
[SaaS Roadmap](docs/saas-roadmap.md) (est. 2-3 months FTE 1.0)

🚀 Project Overview

	•	Tech Stack: TypeScript, Node.js, Express, Prisma, Postgres for application data and state, Redis for queuing and job processing
	•	Design Philosophy: Minimal library usage, coding from first principles for a lightweight and fast application
	•	Development Approach: Test-Driven Development (TDD) with Jest for unit and integration tests, moving towards end-to-end (E2E) testing
	•	Deployment: Hosted on AWS Elastic Beanstalk, Postgres also hosted on AWS

🌟 Features

1. Content Ingestion Endpoint

An API endpoint that accepts input sources with optional query parameters:
	•	Query Parameters:
    •	publishingDestinations: Target platforms for publishing
    •	minBlogLength & maxBlogLength: Desired length range of the blog
    •	style: Writing style preferences
    •	tone: Tone of the content
    •	educationLevel: Target audience’s education level
    •	blogContentType: Type of content (e.g., thought leadership, technical, clinical)
    •	llmEnhancements: Desired AI enhancements (e.g., generate summary, extract keywords)
    •	Input Format: Minimally structured Markdown file with:
    •	Title (optional): If absent, a title will be generated in the pipeline
    •	Focus Points (optional)
    •	Body: Main content
    •	Tags (optional)

2. Original Source Storage

	•	Each input is assigned a unique ID.
	•	Stored in the original_source database table for tracking and reference.

3. Content Processing Pipeline

The pipeline is divided into three queues:
	1.	Content Standardization: Normalizes the content structure.
	2.	Content Processing: Enhances content through multiple stages.
	3.	Content Publishing: Prepares content for release.

	•	Transformation Tracking: A database table logs content at various transformation stages.

4. Content Processing Stages

	•	AI Enhancement:
	•	Dynamically composed prompts based on query parameters (tone, style).
	•	AI operations initially handled by OpenAI’s remote services.
	•	SEO Enhancement: Optimizes content for search engines.
	•	Approval Stage: Content is held for personal review and approval before publishing.

5. Publishing Workflow

	•	Post-Approval Scheduling:
    •	Approved content moves to the publishing queue.
    •	Initially schedules one article per day.
    •	Future enhancements will manage custom delivery across multiple channels based on queue length and    channel feedback.
	•	API Access:
    •	Retrieve articles in the review stage by ID and title.
    •	Future search functionality to query by keywords, subjects, tags, etc.

6. Notifications and Logging

	•	Email Notifications: Receive emails upon successful publication of articles.
	•	Error Logging: Comprehensive logs for any failures during processing stages.

7. Pipeline Statistics API

	•	An endpoint to retrieve statistics across the entire pipeline for monitoring and analytics.

8. Deployment and Scalability

	•	AWS Deployment: Hosted on AWS Elastic Beanstalk for scalability and reliability.
	•	Lightweight Architecture: Minimal dependencies to ensure high performance.

9. Testing Strategy

	•	Test Coverage: Comprehensive unit and integration tests using Jest.
	•	Development Methodology: Primarily Test-Driven Development (TDD).
	•	Future Testing: Plans to implement E2E testing to cover the entire application flow.

🛠️ Future Development Plans

Front-End Application

	•	Tech Stack: TypeScript, React, Tailwind CSS
	•	Deployment: Likely on Vercel or AWS
	•	Features:
    •	Full CRUD operations
    •	Drag-and-drop file uploads
    •	Multi-document uploads
    •	Web clipping via a separate web scraper
    •	Rich text editor
    •	Scheduling options with a calendar view
    •	Manual schedule editing and release parameter profiles
    •	Mobile-first design for on-the-go usage
    •	Voice note capturing for real-time idea addition
    •	Testing:
    •	TDD using React Testing Library
    •	E2E testing for the front-end application

Custom LLM Integration

	•	Objective: Host a custom open-source Large Language Model (LLM) fine-tuned on personal writing style.
	•	Hosting: Google Cloud Platform
	•	Technologies:
	•	Agentic workflows with Python LangChain framework
	•	Inspection with LangGraph
	•	Future LLM Instances:
	•	A separate LLM for clinical blog creation, fine-tuned on anonymized client data.

Multi-Media Content Conversion

	•	Expansion: Support for various input and output types.
	•	Goal: Enable full multimedia conversion into blogs and other content forms.

📈 Project Status

	•	Current Phase: Developing the first end-to-end pipeline as a proof of concept.
	•	Test Coverage: High coverage with unit and integration tests. E2E tests to be added in future stages.

📬 Get Involved

	•	Contributions: Feel free to fork the repository and submit pull requests.
	•	Issues: Report bugs or request features via the GitHub Issues tab.

📝 License

This project is open-source and available under the MIT License.

Developed with ❤️ and TypeScript.

🎯 Getting Started

Prerequisites

	•	Node.js (v14 or above)
	•	npm or yarn
	•	AWS Account (for deployment)
	•	OpenAI API Key (for AI enhancements)

🚀 Installation

	1.	Clone the Repository

git clone https://github.com/yourusername/content-pipeline-project.git


	2.	Install Dependencies

cd content-pipeline-project
npm install
# or
yarn install


	3.	Set Up Environment Variables
Create a .env file in the root directory and add your configuration:

OPENAI_API_KEY=your_openai_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
DATABASE_URL=your_database_connection_string


	4.	Run Tests

npm test
# or
yarn test


	5.	Start the Application

npm start
# or
yarn start



📚 Documentation

	•	API Endpoints: Detailed API documentation is available in the API Docs.
	•	Developer Guide: For contributing guidelines and development setup, refer to the Developer Guide.

📊 Test Coverage

	•	Unit Tests: Comprehensive coverage with Jest.
	•	Integration Tests: Key integration points tested.
	•	Coverage Report: Available in the coverage directory after running tests.

Feel free to explore, contribute, and provide feedback to help improve the Content Pipeline Project!

🙏 Acknowledgments

	•	OpenAI: For providing powerful AI capabilities.
	•	AWS: For scalable deployment solutions.
	•	Community Contributors: Thank you to everyone who has contributed to this project.

📫 Contact

	•	Email: your.email@example.com
	•	GitHub: yourusername

Last updated on {{current_date}}.