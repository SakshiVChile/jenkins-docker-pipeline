pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    // Check the repository for new commits every ~2 minutes.
    // (Works without exposing Jenkins to the internet. See README for the webhook option.)
    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        IMAGE_NAME     = 'jenkins-demo-app'
        CONTAINER_NAME = 'jenkins-demo-app'
        HOST_PORT      = '3000'
    }

    stages {
        stage('Test') {
            steps {
                echo 'Running unit tests inside Docker (build fails if a test fails)...'
                sh 'docker build --target test -t ${IMAGE_NAME}:test .'
            }
        }

        stage('Build') {
            steps {
                echo "Building production image ${IMAGE_NAME}:${BUILD_NUMBER}..."
                sh '''
                    docker build --target production \
                        --build-arg BUILD_NUMBER=${BUILD_NUMBER} \
                        -t ${IMAGE_NAME}:${BUILD_NUMBER} \
                        -t ${IMAGE_NAME}:latest .
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying container ${CONTAINER_NAME} on port ${HOST_PORT}..."
                sh '''
                    docker rm -f ${CONTAINER_NAME} || true
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p ${HOST_PORT}:3000 \
                        --restart unless-stopped \
                        ${IMAGE_NAME}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Verify') {
            steps {
                echo 'Waiting for the container health check to pass...'
                sh '''
                    for i in $(seq 1 20); do
                        status=$(docker inspect --format='{{.State.Health.Status}}' ${CONTAINER_NAME})
                        echo "Health status: ${status}"
                        if [ "${status}" = "healthy" ]; then
                            exit 0
                        fi
                        sleep 3
                    done
                    echo "Container did not become healthy. Logs:"
                    docker logs ${CONTAINER_NAME}
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo "SUCCESS: build #${BUILD_NUMBER} is live at http://localhost:${HOST_PORT}"
        }
        failure {
            echo 'FAILED: check the stage that turned red in the Stage View and open its logs.'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
