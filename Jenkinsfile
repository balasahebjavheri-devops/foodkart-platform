pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Building FoodKart application...'
            }
        }

        stage('Test') {
            steps {
                echo 'Running FoodKart tests...'
            }
        }
    }
}