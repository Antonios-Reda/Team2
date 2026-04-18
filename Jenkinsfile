pipeline {

    agent any

    tools {
        nodejs 'node18'
    }

    environment {
        registryCredential = 'dockerhub_id'
        DOCKER_REGISTRY = 'https://registry.hub.docker.com'
    }

    stages {

        stage('Git Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/KerolisKhalaf/Team2.git'
            }
        }

        stage('Install dependencies') {
            steps {
                sh '''
                set -e

                cd Backend
                npm install

                cd ../Ng-frontend
                npm install --legacy-peer-deps

                cd ../WebRTC_Signaling_Server
                npm install
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                set -e || true

                cd Backend
                cp .env_test .env
                NODE_ENV=test npm test || true
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                set -e

                export NODE_OPTIONS=--openssl-legacy-provider


                cd Backend
                cp .env_deploy .env

                cd ../Ng-frontend
                npm run build

                cd ../WebRTC_Signaling_Server
                npm run build || true
                '''
            }
        }

        stage('Docker Containerization') {
            steps {
                sh '''
                set -e
                docker compose build
                '''
            }
        }

        stage('Deploy on Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub_id',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh '''
                    echo $PASS | docker login -u $USER --password-stdin

                    docker tag telemedicine_devops-backend:latest keroliskhalaf1/telemedicine_backend:${BUILD_NUMBER}
                    docker tag telemedicine_devops-frontend:latest keroliskhalaf1/telemedicine_frontend:${BUILD_NUMBER}
                    docker tag telemedicine_devops-webrtc_server:latest keroliskhalaf1/telemedicine_webrtc_server:${BUILD_NUMBER}

                    docker push keroliskhalaf1/telemedicine_backend:${BUILD_NUMBER}
                    docker push keroliskhalaf1/telemedicine_frontend:${BUILD_NUMBER}
                    docker push keroliskhalaf1/telemedicine_webrtc_server:${BUILD_NUMBER}
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
