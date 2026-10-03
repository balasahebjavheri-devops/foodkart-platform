pipeline {
    agent any

    tools {
        nodejs 'Node24'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Build') {
            steps {
                echo 'FoodKart application build completed.'
            }
        }

        stage('Test') {
            steps {
                echo 'FoodKart tests will be added here.'
            }
        }
    }
}