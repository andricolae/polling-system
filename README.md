# Polling System 📊

[![Deployment Status](https://img.shields.io/badge/deployment-active-brightgreen)](https://polling-system-flax.vercel.app/)
[![Angular](https://img.shields.io/badge/Angular-19-DD0031)](https://angular.io/)
[![Firebase](https://img.shields.io/badge/Firebase-Integrated-FFA000)](https://firebase.google.com/)

## 🔍 Overview

Our Polling System is a dynamic Angular application developed as part of the NTT DATA Tech Trek initiative by Anna, Tudor, and Anca. The app allows users to easily create, distribute, and participate in polls—offering real-time feedback collection, voting simulations, and analytics.

This project showcases a modern polling interface integrated with Firebase for authentication, database storage, and analytics.

## ✨ Features

* **Poll Creation**: Quickly create polls with customizable questions and options
* **Voting Simulation**: Participate in polls and simulate real-time voting behavior
* **Live Results**: View live vote counts and graphical summaries
* **Authentication**: Secure access via Firebase Auth
* **Role-Based Access**: Admins can manage polls, view analytics, and delete entries
* **Responsive Design**: Mobile-first, built with TailwindCSS

## 🚀 Getting Started

### Prerequisites

* Node.js (v20.0 or higher)
* Angular CLI (v19.0 or higher)
* npm (v10.0 or higher)
* Firebase account

## 🔥 Firebase Configuration

This project uses Firebase services and requires proper configuration via environment variables. 

### 📋 Prerequisites:

1. You need a Firebase account. If you don't have one, sign up at [firebase.google.com](https://firebase.google.com/).
2. Create a new Firebase project or use an existing one.
3. Configure the following services in your Firebase project:
   * Firebase Authentication
   * Cloud Firestore
   * Firebase Storage
   * Google Analytics (optional, but required for the measurement ID)

> [!NOTE]
> All these services must be properly configured before the application can function correctly.

### 🔑 Getting your Firebase Configuration Keys:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on the gear icon (⚙️) next to "Project Overview" to access Project settings
4. Scroll down to "Your apps" section and select your web app (or create one by clicking the web icon </> if you haven't added one yet)
5. Under the "SDK setup and configuration" section, you'll find your Firebase configuration object which contains all the required keys
6. For Google Vision API and Gemini API keys, you'll need to enable these services in the Google Cloud Console associated with your Firebase project

### 🛠️ Additional Firebase Setup:

1. **Firebase Authentication**: Enable the authentication methods you plan to use (Email/Password, Google, etc.)
2. **Cloud Firestore**: Create a new database and set up appropriate security rules
4. **Firebase Storage**: Set up storage and configure security rules

> [!TIP]
> Consider using Firebase's development and production environments to separate your testing from live data.

## 💻 Installation

### Clone the repository:
```bash
  git clone https://github.com/andricolae/polling-system.git
```

### Navigate to the project directory:
```bash
  cd polling-system
```

### Install dependencies
```bash
  Install dependencies:
```

### Set up environment variables

Create a .env file in the root directory of the project with the following structure:

```javascript
  API_KEY="your-firebase-api-key"
  AUTH_DOM="your-firebase-auth-domain"
  PROJ_ID="your-firebase-project-id"
  STORAGE="your-firebase-storage-bucket"
  MESS_SEND_ID="your-firebase-messaging-sender-id"
  APP_ID="your-firebase-app-id"
  MEASURE_ID="your-firebase-measurement-id"
  GOGL_VISION="your-google-vision-api-key"
  GMNI="your-gemini-api-key"
  DB_URL="your-firebase-database-url"
```

Replace the placeholder values with your project credentials. You can find these values in your Firebase project settings.

The "start" option in package.json will generate the environment variable script based on your .env file

```json
  "start": "node -r dotenv/config mynode.js && ng serve",
```

> [!CAUTION]
> Never commit your .env or environment.ts file to version control. These files contain sensitive API keys and credentials that should remain private.

### Start the development server

```bash
  ng serve
```

> [!NOTE]
> Open your browser and navigate to http://localhost:4200

## 🏗️ Architecture

##### The application follows a modular architecture with:

* Core: Auth, routing, API guards
* Features: Poll creation, poll viewer, result dashboard
* Shared: Buttons, modals, input components
* State Management: Local state (RxJS-based); NgRx planned for future release

#### Tech Stack

* Frontend: Angular 19
* Authentication: Firebase Auth
* CI/CD: Github and Vercel

## 👥 Team

The Polling System was developed by the following Tech Trek Angular team at NTT DATA 

| Name | Role |
| --- | --- |
| Anna Marita Thuri | Visual Experience Architect |
| Tudor Ovidiu Atodiresei | Authentication Guardian |
| Andrei Nicolae Calutiu | Voting Engineer |

### 🤝 Contributing

As this is an internal Tech Trek project, contributions are welcome from all NTT DATA employees. 

Please follow these steps:
1. Check the issue tracker for open tasks
2. Request to be assigned to an issue
3. Create a feature branch from develop
4. Submit a merge request with your changes
5. Ensure CI/CD pipeline passes
6. Request a code review from the team

> [!IMPORTANT]
> Always create a new branch from develop for your features, not from main.

## 📝 License
This project is proprietary and confidential. The code and its assets are the exclusive property of NTT DATA. Unauthorized use, reproduction, or distribution is prohibited.
© 2025 NTT DATA | All Rights Reserved
