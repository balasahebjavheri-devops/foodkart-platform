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

        stage('Test EC2 SSH') {
            steps {
                sshagent(['foodkart-ec2-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no \
                            ec2-user@13.235.42.162 \
                            "echo EC2_CONNECTION_SUCCESSFUL"
                    '''
                }
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
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                sshagent(['foodkart-ec2-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ec2-user@13.235.42.162 "
                            set -e

                            echo 'Connecting to AWS EC2...'

                            cd ~/foodkart-platform

                            echo 'Pulling latest code...'
                            git pull origin main

                            echo 'Rebuilding and restarting FoodKart...'
                            docker-compose up -d --build

                            echo 'Checking containers...'
                            docker-compose ps

                            echo 'Waiting for application...'
                            sleep 5

                            echo 'Running health check...'
                            curl --fail http://localhost:3000/api/health

                            echo 'AWS FoodKart deployment successful.'
                        "
                    '''
                }
            }
        }
    }
}