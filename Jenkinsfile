pipeline {
    agent {
        label 'windows && docker'
    }
    environment {
        IMAGE = 'junaidh1331/my-node-app'
        DEPLOY_DIR = 'C:\\blue-green-deploy'
    }
    parameters {
        string(name: 'VERSION', defaultValue: 'v2')
        choice(name: 'TARGET_ENV', choices: ['green', 'blue'])
    }
    stages {
        stage('Build & Push') {
            steps {
                bat "docker build -t ${IMAGE}:${params.VERSION} ."
                withCredentials([usernamePassword(credentialsId: 'docker-pas', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    bat "echo %PASS% | docker login -u %USER% --password-stdin"
                    bat "docker push ${IMAGE}:${params.VERSION}"
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    def port = params.TARGET_ENV == 'blue' ? '3001' : '3002'
                    bat """
                        docker stop ${params.TARGET_ENV} || exit 0
                        docker rm ${params.TARGET_ENV} || exit 0
                        docker run -d --name ${params.TARGET_ENV} -p ${port}:3000 ${IMAGE}:${params.VERSION}
                    """
                }
            }
        }
        stage('Health Check') {
            steps {
                script {
                    def port = params.TARGET_ENV == 'blue' ? '3001' : '3002'
                    bat "curl -f http://localhost:${port} || exit 1"
                }
            }
        }
        stage('Switch') {
            steps {
                script {
                    def target = params.TARGET_ENV == 'blue' ? 'blue:3000' : 'green:3000'
                    bat """
                        powershell -Command "(Get-Content ${DEPLOY_DIR}\\nginx.conf) -replace 'server .*;', 'server ${target};' | Set-Content ${DEPLOY_DIR}\\nginx.conf"
                        docker restart nginx
                    """
                }
            }
        }
    }
    post {
        success { echo "Deployed v${params.VERSION} → ${params.TARGET_ENV} (Zero Downtime!)" }
    }
}