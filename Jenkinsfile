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
        stage('Docker Build') {
            steps {
        sh 'docker build -t foodkart-backend:build-${BUILD_NUMBER} ./backend'
           }
        }
stage('Docker Deploy') {
    steps {
        sh '''
            echo "Checking current deployment..."

            PREVIOUS_IMAGE=$(docker inspect foodkart-backend-jenkins \
                --format '{{.Config.Image}}' 2>/dev/null || true)

            echo "Previous image: ${PREVIOUS_IMAGE}"

            echo "${PREVIOUS_IMAGE}" > previous_image.txt

            echo "Deploying new image..."

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
        script {
            try {
                sh '''
                    echo "Waiting for application to start..."
                    sleep 5

                    echo "Running FoodKart health check..."

                    curl --fail http://foodkart-backend-jenkins:3000/api/health

                    echo "FoodKart deployment health check passed."
                '''
            } catch (Exception e) {

                echo "Health check FAILED. Starting rollback..."

                sh '''
                    PREVIOUS_IMAGE=$(cat previous_image.txt)

                    echo "Previous image: ${PREVIOUS_IMAGE}"

                    if [ -n "$PREVIOUS_IMAGE" ]; then

                        echo "Removing unhealthy deployment..."
                        docker rm -f foodkart-backend-jenkins || true

                        echo "Starting previous version..."

                        docker run -d \
                            --name foodkart-backend-jenkins \
                            --network foodkart-platform_default \
                            -e DB_HOST=postgres \
                            -e DB_PORT=5432 \
                            -e DB_USER=foodkart \
                            -e DB_PASSWORD=foodkart123 \
                            -e DB_NAME=foodkart \
                            -p 3001:3000 \
                            "$PREVIOUS_IMAGE"

                        echo "Rollback completed."

                    else
                        echo "No previous image found. Rollback skipped."
                    fi
                '''

                error("Deployment failed. Rollback completed.")
            }
        }
    }
}
    }
}
