pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat '"C:\\Users\\nunes\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" build -t student-task-manager:latest .'
            }
        }

        stage('Deploy Application') {
            steps {
                bat '"C:\\Users\\nunes\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" rm -f student-task-manager-deploy 2>nul'
                bat '"C:\\Users\\nunes\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" run -d --name student-task-manager-deploy -p 3001:3000 student-task-manager:latest'
            }
        }
    }

    post {
        success {
            echo 'CI/CD Pipeline and deployment completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}