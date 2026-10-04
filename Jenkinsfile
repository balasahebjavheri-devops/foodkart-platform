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
              dir('backend') {
                    sh 'npm test'
                }
           }
        }
        stage('Docker Build') {
            steps {
        sh 'docker build -t foodkart-backend:build-${BUILD_NUMBER} ./backend'
           }
        }
        stage('Docker Deploy') {
            steps {
            sh '''
            docker rm -f foodkart-backend-jenkins || true

            docker run -d \
                --name foodkart-backend-jenkins \
                --network foodkart-platform_default \
                -e DB_HOST=postgres \
                -e DB_PORT=5432 \
                -e DB_USER=foodkart \
                -e DB_PASSWORD=foodkart123 \
                -e DB_NAME=foodkart \
                -p 3001:3000 \
                foodkart-backend:build-${BUILD_NUMBER}
        '''
          }
       }
       stage('Health Check') {
    steps {
        sh '''
            echo "Waiting for application to start..."
            sleep 5

            echo "Running FoodKart health check..."
            curl --fail http://foodkart-backend-jenkins:3000/api/health

            echo "FoodKart deployment health check passed."
        '''
    }
}
    }
}
